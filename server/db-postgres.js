import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : undefined,
  max: 4,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  statement_timeout: 10000,
});
pool.on("error", () => console.error("Database connection is temporarily unavailable."));
await pool.query(`
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    payload JSONB NOT NULL CHECK(jsonb_typeof(payload) = 'object')
  );
  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    payload JSONB NOT NULL CHECK(jsonb_typeof(payload) = 'object')
  );
  CREATE INDEX IF NOT EXISTS leads_status ON leads ((payload->>'status'));
  CREATE INDEX IF NOT EXISTS reviews_status ON reviews ((payload->>'status'));
  CREATE TABLE IF NOT EXISTS lead_notifications (
    lead_id TEXT PRIMARY KEY REFERENCES leads(id) ON DELETE CASCADE,
    state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sending','sent')),
    attempts INTEGER NOT NULL DEFAULT 0,
    next_attempt_at BIGINT NOT NULL DEFAULT 0,
    lease_until BIGINT NOT NULL DEFAULT 0,
    sent_at TEXT
  );
`);
export const databaseHealth = async () => (await pool.query("SELECT 1 AS ok")).rows[0];
export const listReviews = async () => (await pool.query("SELECT payload FROM reviews ORDER BY payload->>'updatedAt' DESC")).rows.map(row => row.payload);
export const getReviewById = async id => (await pool.query("SELECT payload FROM reviews WHERE id=$1", [id])).rows[0]?.payload;
export const saveReview = async review => {
  const value = { approvedAt: null, rejectedAt: null, ...review };
  await pool.query("INSERT INTO reviews(id,payload) VALUES ($1,$2)", [review.id, value]);
  return value;
};
export const updateReviewStatus = async (id, status) => {
  const now = new Date().toISOString();
  const patch = { status, updatedAt: now, approvedAt: status === "approved" ? now : null, rejectedAt: status === "rejected" ? now : null };
  return (await pool.query("UPDATE reviews SET payload=payload || $2::jsonb WHERE id=$1 RETURNING payload", [id, patch])).rows[0]?.payload;
};
export const deleteReviewById = async id => ({ changes: (await pool.query("DELETE FROM reviews WHERE id=$1", [id])).rowCount });
export const countStatuses = async () => (await listReviews()).reduce((counts, review) => { if (review.status in counts) counts[review.status]++; return counts; }, { pending: 0, approved: 0, rejected: 0 });
export const listLeads = async status => (await pool.query(status ? "SELECT payload FROM leads WHERE payload->>'status'=$1 ORDER BY payload->>'createdAt' DESC" : "SELECT payload FROM leads ORDER BY payload->>'createdAt' DESC", status ? [status] : [])).rows.map(row => row.payload);
export const getLeadById = async id => (await pool.query("SELECT payload FROM leads WHERE id=$1", [id])).rows[0]?.payload;
export const saveLead = async (lead, notify = process.env.LEAD_NOTIFICATIONS_DISABLED !== "1") => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("INSERT INTO leads(id,payload) VALUES ($1,$2)", [lead.id, lead]);
    if (notify) await client.query("INSERT INTO lead_notifications(lead_id) VALUES ($1)", [lead.id]);
    await client.query("COMMIT");
    return lead;
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
};
export const updateLeadStatus = async (id, status) => (await pool.query("UPDATE leads SET payload=payload || $2::jsonb WHERE id=$1 RETURNING payload", [id, { status, updatedAt: new Date().toISOString() }])).rows[0]?.payload;
export const deleteLeadById = async id => ({ changes: (await pool.query("DELETE FROM leads WHERE id=$1", [id])).rowCount });
export const countLeadStatuses = async () => (await listLeads()).reduce((counts, lead) => { if (lead.status in counts) counts[lead.status]++; return counts; }, { new: 0, handled: 0 });
export const claimLeadNotification = async (now = Date.now()) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(`
      SELECT lead_id, attempts FROM lead_notifications
      WHERE (state='pending' AND next_attempt_at <= $1) OR (state='sending' AND lease_until <= $1)
      ORDER BY next_attempt_at, lead_id FOR UPDATE SKIP LOCKED LIMIT 1
    `, [now]);
    const job = result.rows[0];
    if (!job) { await client.query("COMMIT"); return null; }
    await client.query("UPDATE lead_notifications SET state='sending',attempts=attempts+1,lease_until=$2 WHERE lead_id=$1", [job.lead_id, now + 60000]);
    const lead = (await client.query("SELECT payload FROM leads WHERE id=$1", [job.lead_id])).rows[0]?.payload;
    await client.query("COMMIT");
    return { lead, attempts: job.attempts + 1 };
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
};
export const finishLeadNotification = async (id, sent, attempts, now = Date.now()) => {
  if (sent) await pool.query("UPDATE lead_notifications SET state='sent',sent_at=$2,lease_until=0 WHERE lead_id=$1 AND attempts=$3 AND state='sending'", [id, new Date(now).toISOString(), attempts]);
  else {
    const delay = Math.min(15 * 60000, 30000 * 2 ** Math.min(attempts - 1, 5));
    await pool.query("UPDATE lead_notifications SET state='pending',next_attempt_at=$2,lease_until=0 WHERE lead_id=$1 AND attempts=$3 AND state='sending'", [id, now + delay, attempts]);
  }
};

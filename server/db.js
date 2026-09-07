// Production uses durable external storage; local SQLite remains available for tests.
if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL && !process.env.DB_PATH) {
  throw new Error("DATABASE_URL or an explicitly persistent DB_PATH is required in production");
}
const adapter = await import(process.env.DATABASE_URL ? "./db-postgres.js" : "./db-sqlite.js");
export const { listReviews, saveReview, getReviewById, updateReviewStatus, deleteReviewById, countStatuses, listLeads, saveLead, getLeadById, updateLeadStatus, deleteLeadById, countLeadStatuses, claimLeadNotification, finishLeadNotification, databaseHealth } = adapter;

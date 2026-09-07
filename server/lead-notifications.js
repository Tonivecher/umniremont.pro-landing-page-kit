import { claimLeadNotification, finishLeadNotification } from "./db.js";
import { isLeadEmailConfigured, sendLeadNotification } from "./mail.js";

let running = null;

export const deliverPendingLeadNotifications = ({ send = sendLeadNotification, now = Date.now, limit = 10 } = {}) => {
  if (running) return running;
  running = (async () => {
    let delivered = 0;
    for (let index = 0; index < limit; index += 1) {
      const job = await claimLeadNotification(now());
      if (!job) break;
      let sent = false;
      try {
        sent = Boolean((await send(job.lead)).sent);
      } catch {
        console.error(`Lead notification ${job.lead.id} will be retried.`);
      }
      await finishLeadNotification(job.lead.id, sent, job.attempts, now());
      if (sent) delivered += 1;
    }
    return delivered;
  })().finally(() => { running = null; });
  return running;
};

export const wakeLeadNotifications = () => {
  if (process.env.LEAD_NOTIFICATIONS_DISABLED === "1" || !isLeadEmailConfigured) return;
  void deliverPendingLeadNotifications().catch(() => console.error("Lead notification queue is temporarily unavailable."));
};

export const startLeadNotifications = () => {
  wakeLeadNotifications();
  const timer = setInterval(wakeLeadNotifications, 30_000);
  timer.unref();
  return () => clearInterval(timer);
};

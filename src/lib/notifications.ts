// Web notification permission. On iOS this maps to UserNotifications (daily
// quote, reminder, streak-at-risk). On web we can request permission and store
// the reminder time; actual scheduling needs a service worker.
// TODO(decision): register a service worker to deliver scheduled web reminders.
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
}

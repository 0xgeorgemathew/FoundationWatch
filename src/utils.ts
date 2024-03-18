export function printCurrentTime(): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  };

  const currentTime = new Date();
  return currentTime.toLocaleTimeString("en-IN", options);
}

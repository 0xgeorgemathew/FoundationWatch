export function printCurrentTime(): string {
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Kolkata",
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  };

  const currentTime = new Date();
  const formattedDate = currentTime
    .toLocaleDateString("en-IN", dateOptions)
    .replace(/\//g, ".");
  const formattedTime = currentTime.toLocaleTimeString("en-IN", timeOptions);

  return `${formattedTime}  ${formattedDate}`;
}

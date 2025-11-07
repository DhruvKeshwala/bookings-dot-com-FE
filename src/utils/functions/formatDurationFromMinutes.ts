export function formatDurationFromMinutes(input: number | string): string {
  const minutes = typeof input === "string" ? parseInt(input, 10) : input;

  if (isNaN(minutes) || minutes <= 0) return "0m";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const parts: string[] = [];
  if (hours) parts.push(`${hours}h`);
  if (remainingMinutes) parts.push(`${remainingMinutes}m`);

  return parts.join(" ");
}


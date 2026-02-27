export function formatRelativeOrAbsolute(
  dateString: string,
  locale = "en-US",
): string {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffDays = Math.floor(diffSeconds / 86400);

  // Cut-off: 30 days
  if (diffDays >= 30) {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  // ===== RELATIVE =====
  const rtf = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
  });

  const divisions: {
    amount: number;
    name: Intl.RelativeTimeFormatUnit;
  }[] = [
    { amount: 60, name: "seconds" },
    { amount: 60, name: "minutes" },
    { amount: 24, name: "hours" },
    { amount: 7, name: "days" },
    { amount: 4.34524, name: "weeks" },
  ];

  let duration = -diffSeconds; // Negative = past

  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }

  return rtf.format(Math.round(duration), "weeks");
}

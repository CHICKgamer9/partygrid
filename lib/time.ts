export function calendarDate(date = new Date(), timeZone = "UTC") {
  return date.toLocaleDateString("en-CA", { timeZone });
}

export function formatWhen(date: Date, timeZone?: string | null, withTime = true) {
  const zone = timeZone && timeZone.length > 0 ? timeZone : "UTC";
  try {
    return date.toLocaleString("en", {
      timeZone: zone,
      dateStyle: "medium",
      ...(withTime ? { timeStyle: "short" } : {}),
    });
  } catch {
    return date.toLocaleString("en", {
      timeZone: "UTC",
      dateStyle: "medium",
      ...(withTime ? { timeStyle: "short" } : {}),
    });
  }
}

export function ageFromDob(dob: Date, now = new Date()) {
  let age = now.getFullYear() - dob.getFullYear();
  const monthDelta = now.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

export function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function clockMs() {
  return Date.now();
}

export function isExpired(expiresAt: Date, now = clockMs()) {
  return expiresAt.getTime() <= now;
}

export function relativeExpiry(expiresAt: Date, now = clockMs()) {
  const ms = expiresAt.getTime() - now;
  if (ms <= 0) return "Expired";
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min left`;
  const hours = Math.round(mins / 60);
  return `${hours}h left`;
}

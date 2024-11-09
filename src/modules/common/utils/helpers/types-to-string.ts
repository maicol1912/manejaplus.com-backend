export function dateToString(date: Date | null) {
  return date?.toISOString() ?? '';
}

export function numberToString(number: number) {
  return String(number);
}

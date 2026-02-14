export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, maximumFractionDigits = 6) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits,
  }).format(value);
}

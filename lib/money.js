// "₦12,500" — safe on client and server.
export function formatNaira(amount) {
  const n = Number(amount) || 0;
  return `₦${n.toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

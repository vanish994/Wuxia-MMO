export function normalizeVector(x, y) {
  const length = Math.hypot(x, y);
  if (!length) return { x: 0, y: 0 };
  const scale = Math.min(1, 1 / length);
  return { x: x * scale, y: y * scale };
}

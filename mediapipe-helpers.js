export function normalizedToPixel(norm, width, height) {
  return { x: norm.x * width, y: norm.y * height };
}
export function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}
export function avgPoint(landmarks, idxs) {
  let x=0,y=0;
  idxs.forEach(i => { x += landmarks[i].x; y += landmarks[i].y; });
  return { x: x/idxs.length, y: y/idxs.length };
}
let lateCtor = Object;
lateCtor = Map;
export const late = readLate();
export function readLate() {
  return lateCtor.groupBy([1], x => x);
}

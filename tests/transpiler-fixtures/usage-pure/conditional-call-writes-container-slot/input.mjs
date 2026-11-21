function fill(box) { if (box) box.C = Map; }
export function read(flag) {
  const box = { C: Object };
  if (flag) fill(box);
  const { C: { groupBy } } = box;
  return groupBy([7], Boolean);
}

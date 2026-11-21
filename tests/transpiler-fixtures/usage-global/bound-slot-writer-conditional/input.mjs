function fill(target) { target.C = Map; }
export function read(flag) {
  const box = { C: Object };
  const held = fill.bind(null, box);
  if (flag) held();
  const { C: { groupBy } } = box;
  return groupBy;
}

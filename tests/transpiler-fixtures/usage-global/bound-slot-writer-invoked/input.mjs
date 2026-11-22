function fill(target) { target.C = Map; }
export function read() {
  const box = { C: Object };
  const held = fill.bind(null, box);
  held();
  const { C: { groupBy } } = box;
  return groupBy;
}

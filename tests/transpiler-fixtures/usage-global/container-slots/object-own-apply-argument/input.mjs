export function read(override) {
  function fill(target) { target.C = Map; }
  if (override) fill.apply = () => {};
  const box = { C: Object };
  fill.apply(null, [box]);
  const { C: { groupBy } } = box;
  return groupBy([7], Boolean);
}

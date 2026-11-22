function fill(target) { target.C = Map; }
export function read() {
  const box = { C: Object };
  const held = fill.bind(null, box);
  const capture = () => box.C.groupBy;
  const before = capture();
  held();
  return [before, capture()];
}

// single-quasi template literal as computed key: `box[`kind`]` should narrow the
// discriminated union the same as `box.kind` / `box['kind']` shapes
type Box = { kind: 'a'; data: string[] } | { kind: 'b'; data: number };
function pickFirst(box: Box) {
  if (box[`kind`] === 'a') {
    return box.data.at(0);
  }
  return box.data;
}
export { pickFirst };

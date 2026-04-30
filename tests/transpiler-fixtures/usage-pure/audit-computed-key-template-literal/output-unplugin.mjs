import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// single-quasi template literal as computed key: `box[`kind`]` should narrow the
// discriminated union the same as `box.kind` / `box['kind']` shapes
type Box = { kind: 'a'; data: string[] } | { kind: 'b'; data: number };
function pickFirst(box: Box) {
  if (box[`kind`] === 'a') {
var _ref;
    return _atMaybeArray(_ref = box.data).call(_ref, 0);
  }
  return box.data;
}
export { pickFirst };
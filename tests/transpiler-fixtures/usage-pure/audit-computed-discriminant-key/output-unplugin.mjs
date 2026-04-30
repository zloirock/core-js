import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type Box = { kind: 'a'; data: string[] } | { kind: 'b'; data: number };

function pickFirst(box: Box) {
  if (box['kind'] === 'a') {
var _ref;
    return _atMaybeArray(_ref = box.data).call(_ref, 0);
  }
  return box.data;
}
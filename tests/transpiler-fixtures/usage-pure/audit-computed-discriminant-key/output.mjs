import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// computed discriminant access `box['kind']` must narrow the union exactly like the
// dot form `box.kind`. the static-string computed key is equivalent to a property
// access for narrowing purposes
type Box = {
  kind: 'a';
  data: string[];
} | {
  kind: 'b';
  data: number;
};
function pickFirst(box: Box) {
  if (box['kind'] === 'a') {
    var _ref;
    return _atMaybeArray(_ref = box.data).call(_ref, 0);
  }
  return box.data;
}
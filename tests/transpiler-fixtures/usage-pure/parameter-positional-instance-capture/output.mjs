import _at from "@core-js/pure/actual/instance/at";
export function full(_ref, _unused = void 0) {
  let [_ref2] = _ref;
  let at = _at(_ref2);
  return at.call([9], 0);
}
export function partial(_ref3 = [[4, 5]]) {
  let [_ref4] = _ref3;
  let at = _at(_ref4);
  let {
    length
  } = _ref4;
  return [at.call([9], 0), length];
}
export function supplied(_ref5, _unused2 = void 0) {
  let [_ref6] = _ref5;
  let at = _at(_ref6);
  let {
    length
  } = _ref6;
  return [at.call([9], 0), length];
}
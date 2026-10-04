import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A nested instance read through an array wrapper shares its selected slot with surviving
// leaf siblings. The method keeps the same receiver-family narrowing as the flat spelling.
const box = {
  y: [1, [2]]
};
function effect() {
  return 1;
}
const wrapped = function () {
  const _ref = box.y;
  const at = _atMaybeArray(_ref);
  const [{
    other
  }] = [_ref];
  return [at, other];
}();
// An effectful neighbor element or leading declarator must finish before the nested read.
// The wrapper's elements are evaluated once, and surviving bindings keep their values.
const wrappedBesideAnEffect = function () {
  const [, _ref2] = [box, effect()];
  const _ref3 = box.y;
  const at = _atMaybeArray(_ref3);
  const {
    other
  } = _ref3;
  const zn = _ref2;
  return [at, other, zn];
}();
const wrappedAfterAnEffect = function () {
  const zLead = effect(),
    [,] = [box],
    _ref4 = box.y,
    at = _atMaybeArray(_ref4),
    {
      other
    } = _ref4;
  return [zLead, at, other];
}();
// A loop header can capture wrapper elements and lower the following bindings in the same
// declaration. The bodyless variable declaration remains a separate native boundary.
const wrappedInLoopHead = function () {
  let out;
  for (const [, _ref5] = [box, effect()], {
      y: _ref6
    } = box, at = _atMaybeArray(_ref6), {
      other
    } = _ref6, zn = _ref5; !out;) out = [at, other, zn];
  return out;
}();
const wrappedInBodylessSlot = function () {
  let out;
  if (out === undefined) var [, _ref7] = [box, effect()],
    {
      y: _ref8
    } = box,
    at = _atMaybeArray(_ref8),
    {
      other
    } = _ref8,
    zn = _ref7;
  return [at, other, zn];
}();
export { wrapped, wrappedBesideAnEffect, wrappedAfterAnEffect, wrappedInLoopHead, wrappedInBodylessSlot };
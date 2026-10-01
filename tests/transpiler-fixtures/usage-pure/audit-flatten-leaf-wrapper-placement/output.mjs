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
  const [_ref2, _ref3] = [box, effect()];
  const _ref4 = _ref2.y;
  const at = _atMaybeArray(_ref4);
  const {
    other
  } = _ref4;
  const zn = _ref3;
  return [at, other, zn];
}();
const wrappedAfterAnEffect = function () {
  const zLead = effect(),
    [_ref5] = [box],
    _ref6 = _ref5.y,
    at = _atMaybeArray(_ref6),
    {
      other
    } = _ref6;
  return [zLead, at, other];
}();
// A loop header can capture wrapper elements and lower the following bindings in the same
// declaration. The bodyless variable declaration remains a separate native boundary.
const wrappedInLoopHead = function () {
  let out;
  for (const [_ref7, _ref8] = [box, effect()], {
      y: _ref9
    } = _ref7, at = _atMaybeArray(_ref9), {
      other
    } = _ref9, zn = _ref8; !out;) out = [at, other, zn];
  return out;
}();
const wrappedInBodylessSlot = function () {
  let out;
  if (out === undefined) var [_ref10, _ref11] = [box, effect()],
    {
      y: _ref12
    } = _ref10,
    at = _atMaybeArray(_ref12),
    {
      other
    } = _ref12,
    zn = _ref11;
  return [at, other, zn];
}();
export { wrapped, wrappedBesideAnEffect, wrappedAfterAnEffect, wrappedInLoopHead, wrappedInBodylessSlot };
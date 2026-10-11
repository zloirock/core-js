import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// claimed and unclaimed effectful keys over one literal interleave in source order - key, read, key, read
// - and a sibling property after an instance claim is read only after its dispatch
let k = 0;
var _ref = [1],
  {
    [(k++, 'of')]: o7
  } = _ref,
  a7 = (k++, _atMaybeArray(_ref)),
  {
    m7b
  } = _ref;
var _ref2 = [1],
  a8 = (k++, _atMaybeArray(_ref2)),
  {
    m8b
  } = _ref2,
  {
    [(k++, 'of')]: o8
  } = _ref2;
export default [o7, a7, m7b, a8, m8b, o8, k];
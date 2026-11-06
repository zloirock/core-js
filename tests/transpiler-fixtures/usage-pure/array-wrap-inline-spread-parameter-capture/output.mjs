import _at from "@core-js/pure/actual/instance/at";
// Parameter instance leaves capture their supplied or defaulted receiver from the spread array.
// The separate native z pattern retains its own array iteration.
function viaParamDefault(_ref = [...[nb]]) {
  let [_ref2] = _ref;
  let a = _at(_ref2.y);
  return a;
}
class K {
  f = (_ref3 => {
    let [_ref4] = _ref3;
    let b = _at(_ref4.y);
    return b;
  })([...[nb]]);
}
const [{
  z
}] = [...[nb]];
export { viaParamDefault, K, z };
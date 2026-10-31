import _at from "@core-js/pure/actual/instance/at";
// Parameter instance reads capture the supplied or default positional receiver once.
// An unrelated native-only pattern keeps its original spelling.
function viaParamDefault(_ref = [...[nb]]) {
  let [_ref2] = _ref;
  let a = _at(_ref2.y);
  return a;
}
class K {
  f = ((_ref3, _unused = void 0) => {
    let [_ref4] = _ref3;
    let b = _at(_ref4.y);
    return b;
  })([...[nb]]);
}
const [{
  z
}] = [...[nb]];
export { viaParamDefault, K, z };
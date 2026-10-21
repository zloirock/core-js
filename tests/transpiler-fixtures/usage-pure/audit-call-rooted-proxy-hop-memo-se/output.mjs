import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A quiet call-rooted receiver retains synthesis and its call effect.
// Effectful realm keys keep native parameter receivers, defaults and unresolved siblings.
let c = 0;
function rootCall({
  of,
  length
} = function (_ref) {
  return {
    of: _Array$of,
    length: _ref.length
  };
}(((() => {
  c++;
  return _globalThis;
})(), _self).Array)) {
  return [of(1), length];
}
function hopAndRootCall(_ref2 = (() => {
  c += 10;
  return _globalThis;
})()[c++, 'self'].Array) {
  let {
    from
  } = _ref2;
  let name = _nameMaybeFunction(_ref2);
  return [from([1]), name];
}
function bareRootNonPure({
  of,
  byteLength
} = _globalThis[c += 100, 'self'].Array) {
  return [of(1), byteLength];
}
function bareRootCtor({
  get,
  size
} = _globalThis[c += 1000, 'self'].Map) {
  return [get, size];
}
export { rootCall, hopAndRootCall, bareRootNonPure, bareRootCtor, c };
import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// A destructure-default receiver rooted in an SE-bearing CALL through a proxy-global hop, forced through
// the MEMO path by an unresolved sibling key (`length` is not a polyfilled static, so the pattern can't be
// statically extracted). The collapse drops the `.self` hop and re-roots on the pure global, so EVERY effect
// the dropped prefix carried - the chain-root call AND a computed hop-key effect - must re-emit as a sequence
// prefix. Harvesting only the chain-root call dropped a buried hop-key effect on babel. distinct sibling key
// per line so each polyfill import attributes to its line.
let c = 0;
function rootCall({ of, length } = (function (_ref) { return { of: _Array$of, length: _ref.length }; })(((() => {
  c++;
  return _globalThis;
})(), _globalThis).Array)) {
  return [of(1), length];
}
function hopAndRootCall({ from, name } = (function (_ref2) { return { from: _Array$from, name: _ref2.name }; })(((() => {
  c += 10;
  return _globalThis;
})(), c++, _globalThis).Array)) {
  return [from([1]), name];
}
// BARE proxy-global root (no chain-root call) with a SE-bearing hop key: maximalProxyGlobalPrefix bails on
// the SE hop, so the unplugin root-swap must instead route through the call-rooted collapse to harvest the
// hop-key effect and drop the dead `.self` - non-pure leaf re-roots, pure-ctor leaf whole-swaps.
function bareRootNonPure({ of, byteLength } = (function (_ref3) { return { of: _Array$of, byteLength: _ref3.byteLength }; })((c += 100, _globalThis).Array)) {
  return [of(1), byteLength];
}
function bareRootCtor({ get, size } = (c += 1000, _Map)) {
  return [get, size];
}
export { rootCall, hopAndRootCall, bareRootNonPure, bareRootCtor, c };
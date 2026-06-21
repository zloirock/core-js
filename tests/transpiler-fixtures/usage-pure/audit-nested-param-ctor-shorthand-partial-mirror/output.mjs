import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// a polyfillable-CONSTRUCTOR binding (`Set` shorthand, `Map` rename) alongside a nested-proxy method
// (`Array.from`) off globalThis. `Array.from` mirrors to its pure import; the WHOLE `Set`/`Map` ctor
// binding IS the pure constructor `_Set`/`_Map` (not a native `_globalThis.Set` passthrough that throws
// off-engine + mis-values). the nested mirror owns the WHOLE receiver - a flat synth-swap must NOT race
// it (a nested-value pattern is not "simple", and the body-extract / inline-default fallbacks defer too)
function withCtorShorthand({
  Array: {
    from
  },
  Set,
  Map: M
} = {
  Array: {
    from: _Array$from
  },
  Set: _Set,
  Map: _Map
}) {
  return [from, Set, M];
}
export { withCtorShorthand };
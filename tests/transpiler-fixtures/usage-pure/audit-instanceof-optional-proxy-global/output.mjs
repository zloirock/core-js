import _Map from "@core-js/pure/actual/map/constructor";
// `x instanceof globalThis?.Map` — RHS is optional-chain proxy-global, identify Map
function check(x) {
  return x instanceof _Map;
}
check(new _Map());
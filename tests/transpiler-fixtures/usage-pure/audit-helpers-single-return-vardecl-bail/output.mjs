import _values from "@core-js/pure/actual/instance/values";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _keys from "@core-js/pure/actual/instance/keys";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
import _entries from "@core-js/pure/actual/instance/entries";
// singleReturnBodyExpression bails on local-binding declarations: a `const` in the IIFE
// body shadows the caller-scope free identifier the caller would resolve against. inline
// resolution must NOT propagate `Map` here as a global polyfill candidate. distinct method
// per line (.values / .keys / .entries) makes per-call dispatch observable
const v = _values((() => {
  const Map = _WeakMap;
  return Map;
})().prototype);
const k = _keys((() => {
  const Set = _WeakSet;
  return Set;
})().prototype);
const e = _entries((() => {
  const Array = String;
  return Array;
})().prototype);
export { v, k, e };
// singleReturnBodyExpression bails on local-binding declarations: a `const` in the IIFE
// body shadows the caller-scope free identifier the caller would resolve against. inline
// resolution must NOT propagate `Map` here as a global polyfill candidate. distinct method
// per line (.values / .keys / .entries) makes per-call dispatch observable
const v = (() => { const Map = WeakMap; return Map; })().prototype.values;
const k = (() => { const Set = WeakSet; return Set; })().prototype.keys;
const e = (() => { const Array = String; return Array; })().prototype.entries;
export { v, k, e };

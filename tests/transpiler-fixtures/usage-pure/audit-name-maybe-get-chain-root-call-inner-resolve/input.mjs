// A function-name read consumes its effectful constructor receiver once, preserving the call
// prefix and all inner polyfills. Returned proxy navigation follows its normal collapse rule,
// and sequence-wrapped receivers retain their preceding effects. Each constructor has its
// own source shape so one rewritten call cannot hide another.
let n = 0;
const memberChain = (() => { n += 1; return globalThis.self; })().window.Map.name;
const polyfillable = (() => { [1].flat(); return globalThis; })().self.Set.name;
const seqWrapped = (n += 10, (() => { n += 100; return globalThis; })().self).Promise.name;
const control = (() => { n += 1000; return globalThis; })().self.WeakMap.name;
export { memberChain, polyfillable, seqWrapped, control, n };

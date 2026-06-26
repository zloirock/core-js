import _getIterator from "@core-js/pure/actual/get-iterator";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// OPTIONAL `[Symbol.iterator]` on a proxy chain-root-CALL receiver `(call)?.self[Symbol.iterator]`. the
// receiver collapses to the always-defined proxy ROOT (`_globalThis`), so the `?.` on the proxy navigation
// is VESTIGIAL and must be SUBSUMED like babel - keeping the optional guard left a raw `globalThis` call +
// `_ref.self` (ie:11 ReferenceError + a babel/unplugin desync). a pure call drops entirely; an SE call is
// preserved in the collapse sequence `(call, _root)`; a deep `.self.window` hop collapses to the root too.
// fixture-only: the receiver resolves to globalThis (not iterable in Node) and the hazard is off-engine.
let n = 0;
const pureRoot = _getIteratorMethod(_globalThis);
const seCall = [..._getIterator(((() => {
  n += 1;
  return _globalThis;
})(), _globalThis))];
const deepHop = _getIteratorMethod(_globalThis);
export { pureRoot, seCall, deepHop, n };
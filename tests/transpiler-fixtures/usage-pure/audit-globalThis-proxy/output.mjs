import _Map from "@core-js/pure/actual/map/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// `globalThis.Map` — proxy member must resolve to Map polyfill.
// Also test `globalThis.self.Promise.resolve(1)` chain.
const m = new _Map();
const r = _Promise$resolve(1);
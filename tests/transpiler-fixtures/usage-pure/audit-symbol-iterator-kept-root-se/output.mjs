import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// Symbol access retains stores, receiver prefixes and symbol-key effects in source order.
// Effectful realm-hop keys keep their native receiver access.
let a;
export const keptPlain = _getIteratorMethod(a = _globalThis.window);
let b;
let sc = 0;
export const sePrefix = _getIteratorMethod((sc++, b = _globalThis.window));
let c;
export const seInValue = _getIteratorMethod(c = (sc++, _globalThis.window));
let d;
export const seHopKey = _getIteratorMethod((d = _globalThis.window)[sc++, 'self']);
let e;
export const optionalKept = null == (sc++, e = _globalThis.window) ? void 0 : _getIteratorMethod(e);
let f;
export const symbolKeySe = (f = _globalThis.window, sc++, _getIteratorMethod(f));
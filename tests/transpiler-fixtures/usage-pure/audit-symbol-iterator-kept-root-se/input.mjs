// Symbol access retains stores, receiver prefixes and symbol-key effects in source order.
// Effectful realm-hop keys keep their native receiver access.
let a;
export const keptPlain = (a = globalThis.window).self[Symbol.iterator];
let b;
let sc = 0;
export const sePrefix = (sc++, b = globalThis.window).self[Symbol.iterator];
let c;
export const seInValue = (c = (sc++, globalThis.window)).self[Symbol.iterator];
let d;
export const seHopKey = (d = globalThis.window)[(sc++, 'self')][Symbol.iterator];
let e;
export const optionalKept = (sc++, e = globalThis.window)?.self[Symbol.iterator];
let f;
export const symbolKeySe = (f = globalThis.window).self[Symbol[(sc++, 'iterator')]];

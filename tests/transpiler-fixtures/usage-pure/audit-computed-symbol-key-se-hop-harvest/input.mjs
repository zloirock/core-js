// Symbol-key handling retains call-root and ordinary leaf-key effects in evaluation order.
// An effectful realm-hop key keeps its source read and independent nested claims.
let a = 0;
let b = 0;
const log = [];
const arr = [1, 2];
arr[(globalThis[(a++, 'self')].Symbol).iterator];
arr[(globalThis.self[(b++, 'window')].Symbol).iterator];
arr[(() => (log.push('call'), globalThis))()[(log.push('key'), 'Symbol')].iterator];
arr[(() => (log.push('only'), globalThis))().Symbol.iterator];
arr[(() => (log.push('deep'), globalThis))()[(log.push('deep-key'), 'Symbol')][(log.push('deep-ikey'), 'iterator')]];
a;
b;
log;

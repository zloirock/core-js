// In usage-global a presence test this build always answers (a `typeof` in either operand order,
// parenthesized or not, an `in` test of a static key) stays as written and its dead branch injects nothing -
// an `if` statement's included; a probe (`window`), a function global the root resolver does not name
// (`queueMicrotask`) and a prototype method's presence, which only pure decides (`'finally' in
// Promise.prototype`), keep both branches live.
export const resolved = typeof Promise != 'undefined' && Promise.resolve(1);
export const viaStatic = Array.from ? Array.from(list) : legacyFrom(list);
export const keyed = 'allSettled' in Promise ? Promise.allSettled(list) : Array.fromAsync(list);
export const prototyped = 'finally' in Promise.prototype ? task.finally(done) : Iterator.concat(list);
export const fallbackOf = Array.of || legacyOf;
export const symbolic = typeof Symbol === 'function' ? Symbol('x') : '@@x';
export const legacy = typeof Map === 'undefined' ? legacyMap() : new Map();
export const grouped = (typeof Set) === 'undefined' ? new AggregateError(list) : new Set(list);
export const reversed = 'function' === (typeof Promise) ? Promise.try(task) : structuredClone(done);
export const probed = typeof window !== 'undefined' ? window.WeakMap : DisposableStack;
export const queued = typeof queueMicrotask === 'function' ? queueMicrotask(task) : new Float32Array(value);
if (typeof Iterator !== 'undefined') use(Iterator.from(list)); else use(new WeakSet());

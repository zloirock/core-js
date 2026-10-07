// A presence test this build always answers - `typeof` over a global it serves (either operand order,
// parenthesized or not), a global or a static read as a truth value - folds in pure to the operand it
// yields, the test's own import and the dead branch gone. A probe (`window`) keeps its test, so does a
// function global the root resolver does not name (`queueMicrotask`), and an `if` keeps its shape:
// pure folds no statement.
export const resolved = typeof Promise != 'undefined' && Promise.resolve(1);
export const viaStatic = Array.from ? Array.from(list) : legacyFrom(list);
export const fallbackOf = Array.of || legacyOf;
export const symbolic = typeof Symbol === 'function' ? Symbol('x') : '@@x';
export const legacy = typeof Map === 'undefined' ? legacyMap() : new Map();
export const grouped = (typeof Set) === 'undefined' ? new AggregateError(list) : new Set(list);
export const reversed = 'function' === (typeof Promise) ? Promise.try(task) : structuredClone(done);
export const probed = typeof window !== 'undefined' ? window.WeakMap : DisposableStack;
export const queued = typeof queueMicrotask === 'function' ? queueMicrotask(task) : new Float32Array(value);
if (typeof Iterator !== 'undefined') use(Iterator.from(list)); else use(new WeakSet());

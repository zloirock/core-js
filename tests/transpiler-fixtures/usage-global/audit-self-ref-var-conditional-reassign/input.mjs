// usage-global is injection-only on the self-ref var shape (the binding is never
// rewritten), so a CONDITIONAL reassignment does not suppress the injection - the
// cond-false path still reads the pristine global
var Iterator = Iterator;
if (globalThis.cond) Iterator = mock;
export { Iterator };

// negative: an unconditional reassignment DOMINATES the later member use - `es.promise.try`
// stays out (the never-dominated init self-read keeps the constructor set alone)
var Promise = Promise;
Promise = mock2;
export const t = Promise.try;

// hoisting edge: a write TEXTUALLY before the hoisted declarator - injection stays
// (over-inject-safe; at runtime the hoisted local absorbs the early write)
AggregateError = hoistMock;
var AggregateError = AggregateError;
export const ae = AggregateError;

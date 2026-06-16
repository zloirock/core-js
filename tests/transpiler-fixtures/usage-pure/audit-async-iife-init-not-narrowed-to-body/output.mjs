import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A zero-arg expression-body IIFE on a `const` init is peeled to its body, so the binding narrows to the
// body's type: `sync = (() => [1, 2, 3])()` is an Array and `.at` polyfills. but an ASYNC IIFE evaluates to
// a PROMISE, not the body value - so its binding must NOT narrow to Array, and `.includes` stays native
// (injecting `Array#includes` on a Promise would be wrong). distinct methods isolate the two lines: the
// sync line emits the `at` helper, the async line emits nothing
const sync = (() => [1, 2, 3])();
const fromAsync = (async () => [4, 5, 6])();
export const a = _atMaybeArray(sync).call(sync, -1);
export const b = fromAsync.includes(2);
// arrow-function parameters shadow globals (`Array` / `Promise`): both `Array.from(...)`
// and `new Promise(...)` resolve to the local bindings, polyfill emission is skipped.
(Array => Array.from([1]))();
(Promise => new Promise(fn))();

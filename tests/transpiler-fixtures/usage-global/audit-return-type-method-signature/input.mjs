// `ReturnType<typeof X.method>` must resolve when the source is a TSMethodSignature
// shape (`{ method(): T }`), not just a function-typed property (`{ method: () => T }`).
// the structural member lookup used to return a synthetic empty TSFunctionType for regular method
// signatures, so the function-type return extraction found no return slot and the whole
// ReturnType<...> fell back to generic dispatch (over-emit).
declare const X: { method(): number[] };
type R = ReturnType<typeof X.method>;
declare const r: R;
r.at(0);

import "core-js/modules/es.array.at";
// `ReturnType<typeof X.method>` must resolve when the source is a TSMethodSignature
// shape (`{ method(): T }`), not just a function-typed property (`{ method: () => T }`).
// findTypeMember used to return a synthetic empty TSFunctionType for regular method
// signatures, so functionTypeReturnAnnotation found no return slot and the whole
// ReturnType<...> fell back to generic dispatch (over-emit).
declare const X: {
  method(): number[];
};
type R = ReturnType<typeof X.method>;
declare const r: R;
r.at(0);
// SE-tail receiver with NON-optional call: `(0, globalThis).flat(0)` - no `?.` on the
// call. the SE-tail substitution path is independent of call-optionality (it lives in
// `resolveReceiverSource`); asserts the substitution fires for the eager-call form too
(0, globalThis).flat(0);

import _globalThis from "@core-js/pure/actual/global-this";
// SE-tail receiver with NON-optional call: `(0, globalThis).flat(0)` - no `?.` on the
// call. the SE-tail substitution is independent of call-optionality; asserts it
// still fires for the eager-call form.
(0, _globalThis).flat(0);
import _globalThis from "@core-js/pure/actual/global-this";
// dotted + computed-string LHS forms in the same file - both substitute the receiver and
// record their slots (the names deopt for any later read)
_globalThis.Map ||= {};
_globalThis['WeakMap'] ||= {};
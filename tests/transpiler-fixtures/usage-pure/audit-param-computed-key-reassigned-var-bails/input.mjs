// the computed-key variable `K` is REASSIGNED, so its value isn't statically known - the resolver
// can't prove `Array[K]` is `Array.of` and bails (no synth-swap, no polyfill). reading `K` twice in
// a synth default would be unsound: `f()` after `K = "something"` must read `Array["something"]`,
// not `_Array$of`. regression lock that mutable computed keys never reach the const-only synth path
var K = "of";
function f({ [K]: of } = Array) { return of; }
f();
K = "something";

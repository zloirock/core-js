import _at from "@core-js/pure/actual/instance/at";
// cyclic interface extends: A extends B, B extends A. resolveUserDefinedType threads
// a `visited` Set and propagates a `hadCycle` signal up so cyclic chains return null
// (unknown type) instead of falling back to $Object('Object') - that gives the plugin
// the signal to emit generic `_at` rather than suppressing the polyfill entirely
interface A extends B {}
interface B extends A {}
declare const x: A;
_at(x).call(x, 0);
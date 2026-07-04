// an SE-prefixed computed key folding to a KNOWN static deopts the optional call exactly like
// the dotted form: the resolved polyfill is always defined, so the `?.` drops while the key's
// effect stays in place and runs exactly once ahead of the injected static. covers the three
// receiver families - static-context `this`, `super`, and a bare global - each with trailing
// instance polyfills (the shape that previously left the callee raw or emitted overlapping
// rewrites instead of the injected static). a static that resolves NO polyfill on the targets
// (native-only `Array.isArray`) keeps its guard - the deopt premise is the injected binding
let viaThis = 0;
let viaSuper = 0;
let viaGlobal = 0;
class C extends Array {
  static thisForm() {
    return this[(viaThis++, 'from')]?.([1, 2]).flat().at(0);
  }
  static superForm() {
    return super[(viaSuper++, 'of')]?.(1, 2).flat().at(0);
  }
}
export const fromGlobal = Object[(viaGlobal++, 'entries')]?.({ a: 1 });
export const guarded = Array[(0, 'isArray')]?.([1]);
export const r = [C.thisForm(), C.superForm()];

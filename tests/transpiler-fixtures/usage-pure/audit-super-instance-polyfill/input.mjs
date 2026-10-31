// `super.X(args)` from an instance method on a known polyfillable super class is left
// untouched. Spec `super.X` resolves through `[[HomeObject]].[[Prototype]]` (baked at
// class-eval); rewriting to `_X.call(this, args)` shifts dispatch onto `this`, which a
// subclass elsewhere can intercept via overridden `[Symbol.iterator]` / `[Symbol.species]`.
class C extends Array {
  foo(x) { return super.includes(x); }
}
class D extends Array {
  bar() { return super.flat(); }
}

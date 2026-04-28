// `super.X(args)` from an instance method on a known polyfillable super class is
// conservatively left untouched. Spec `super.X` resolves through `[[HomeObject]].[[Prototype]]`
// (statically baked at class-eval); rewriting to `_X.call(this, args)` shifts dispatch onto
// `this`, which a subclass defined in another module can intercept via overridden interface
// methods (`[Symbol.iterator]`, `.constructor[Symbol.species]`, ...). User who wants the
// polyfill explicitly writes `Array.prototype.X.call(this, ...)`
class C extends Array {
  foo(x) { return super.includes(x); }
}
class D extends Array {
  bar() { return super.flat(); }
}

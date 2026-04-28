// `super.X(args)` from an instance method on a known polyfillable super class is
// conservatively left untouched. spec `super.X` resolves through `[[HomeObject]].[[Prototype]]`
// (statically baked at class-eval); rewriting to `_X.call(this, args)` shifts dispatch onto
// `this`, which a subclass defined in another module can intercept via overridden interface
// methods (`[Symbol.iterator]`, `.constructor[Symbol.species]`, ...). user-side fix:
// `Array.prototype.X.call(this, ...)` explicit
class C extends Array {
  foo(x) {
    return super.includes(x);
  }
}
class D extends Array {
  bar() {
    return super.flat();
  }
}
// decorated class extending `Array` with a static method `super.from(...)`: the
// static-method call is rewritten through the polyfilled super constructor.
@decorator class A extends Array { static f(x) { return super.from(x); } }

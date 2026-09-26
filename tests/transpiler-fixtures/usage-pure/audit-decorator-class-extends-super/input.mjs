// decorated class extending a polyfilled built-in with `super.method(...)`: the
// static-method call routes through the pure-mode polyfilled super.
@decorator class A extends Array { static f(x) { return super.from(x); } }

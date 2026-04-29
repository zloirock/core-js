// static-method call via `super.from(...)` from inside a non-static method: the rewrite
// must still target the parent constructor's pure-mode polyfilled static.
class C extends Array { m() { return super.from([1]); } }

// mutually-recursive namespace alias: `const A = NS.P` and `const NS = { P: A }` form
// a cycle. plugin must bail (cycle guard) without infinite recursion or stack overflow.
// `super.try(...)` stays raw - there's no static chain to commit to
const A = NS.P;
const NS = {
  P: A
};
class C extends A {
  static run() {
    return super.try(() => 1);
  }
}
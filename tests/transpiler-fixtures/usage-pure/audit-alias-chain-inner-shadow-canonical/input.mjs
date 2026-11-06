// alias-chain resolution must advance scope to each hop's declaration scope. outer
// `const Inner = Base`; inside `wrap()` an `Inner` shadow inits `LocalThing`. resolving
// `class Sub extends OuterAlias` from inside `wrap()` must walk OuterAlias -> Inner in the
// OUTER scope (where OuterAlias's binding lives). if the call-site scope leaks, the second
// hop hits the inner `const Inner = LocalThing` shadow and Sub mis-registers as LocalThing.
class Base {
  items = [1, 2, 3];
}
const Inner = Base;
const OuterAlias = Inner;
function LocalThing() {}
function wrap() {
  const Inner = LocalThing;
  class Sub extends OuterAlias {}
  const s = new Sub();
  s.items = "fromSub";
  return Inner;
}
function probe() {
  wrap();
  const b = new Base();
  return b.items.at(0);
}
probe();

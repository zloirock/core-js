import _at from "@core-js/pure/actual/instance/at";
// aliasChainCanonicalName must advance scope to each hop's declaration scope. without
// the advance, the original call-site scope leaks across the entire chain and inner
// shadows mis-resolve.
//
// here: outer `const Inner = Base`, then inside `wrap()` a `Inner` shadow with init
// `LocalThing`. when extendsClauseName walks `class Sub extends OuterAlias` from inside
// `wrap()`, the chain should be: OuterAlias (inner-scope) -> init Inner (outer-scope
// resolved because OuterAlias's binding lives in outer). without the scope advance, the
// chain stays anchored at inner scope - second-hop `getBinding('Inner')` returns the
// inner shadow `const Inner = LocalThing` and Sub mis-registers under LocalThing
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
  var _ref;
  wrap();
  const b = new Base();
  return _at(_ref = b.items).call(_ref, 0);
}
probe();
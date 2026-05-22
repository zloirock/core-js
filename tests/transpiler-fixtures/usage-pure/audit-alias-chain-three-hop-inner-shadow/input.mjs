// 3-hop alias chain: `const A = Base; const B = A; const OuterAlias = B`. inside `wrap()`,
// inner `const A = OtherBase` shadows the outermost hop. canonical resolution must advance
// the binding scope at each hop: OuterAlias (inner-scope) -> B (outer-scope, since B's
// binding lives in outer) -> A (outer-scope, ditto). without per-hop scope advance, the
// inner walk hits the local `A = OtherBase` shadow and mis-registers `Sub` under `OtherBase`,
// detaching the `.items` polyfill from the real `Base` chain
class Base {
  items = [1, 2, 3];
}
const A = Base;
const B = A;
const OuterAlias = B;
function OtherBase() {}
function wrap() {
  const A = OtherBase;
  class Sub extends OuterAlias {}
  const s = new Sub();
  s.items = "fromSub";
  return A;
}
function probe() {
  wrap();
  const b = new Base();
  return b.items.at(0);
}
probe();

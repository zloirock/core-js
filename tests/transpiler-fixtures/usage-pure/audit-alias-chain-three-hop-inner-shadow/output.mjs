import _at from "@core-js/pure/actual/instance/at";
// 3-hop alias chain `const A = Base; const B = A; const OuterAlias = B`, where inside
// `wrap()` an inner `const A = OtherBase` shadows the outermost hop. each hop must resolve
// in its own binding scope, else the inner walk picks the local shadow, registers `Sub`
// under `OtherBase`, and detaches the `.items` polyfill from the real `Base` chain
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
  var _ref;
  wrap();
  const b = new Base();
  return _at(_ref = b.items).call(_ref, 0);
}
probe();
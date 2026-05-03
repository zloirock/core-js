import _Array$from from "@core-js/pure/actual/array/from";
// nested-proxy flatten declaration sits INSIDE a class static block, after a sibling
// static block. tests pushBlockScope routing for StaticBlock + flatten coexistence,
// asserting the flatten path queues correctly when the host block is a StaticBlock
let captured;
class Holder {
  static {
    Holder.first = 1;
  }
  static {
    const from = _Array$from;
    captured = from([2]);
  }
}
Holder;
export { captured };
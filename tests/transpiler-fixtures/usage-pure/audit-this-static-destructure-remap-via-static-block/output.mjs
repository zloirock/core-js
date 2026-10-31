import _Array$of from "@core-js/pure/actual/array/of";
// a static{} block is a static context too - the destructure remap resolves through
// the same extends-host gate as static methods
class StaticBlock extends Array {
  static {
    const of = _Array$of;
    this.picked = of;
  }
}
export const viaStaticBlock = StaticBlock.picked;
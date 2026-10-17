// a static{} block is a static context too - the destructure remap resolves through
// the same extends-host gate as static methods
class StaticBlock extends Array {
  static { const { of } = this; this.picked = of; }
}
export const viaStaticBlock = StaticBlock.picked;

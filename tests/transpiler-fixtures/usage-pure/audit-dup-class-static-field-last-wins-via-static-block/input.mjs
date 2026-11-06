// a static block at a LATER position may reassign the field via `NS.field = ...`, so the field's
// value is unknowable -> bail (the class analog of a trailing object spread)
class WithBlock {
  static T = Symbol;
  static {
    WithBlock.T = Array;
  }
}
const { T: { keyFor: viaBlock } } = WithBlock;
export const viaStaticBlock = viaBlock;

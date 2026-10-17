// SIBLING declarators in one declaration each remap independently: the split of the
// first must not derail the later `this` reads (a stale re-visit of the replaced subtree
// walks detached ancestors); the unresolved key keeps its residual read
class ThreeDecl extends Array {
  static m() {
    const { from } = this, { of } = this, { custom } = this;
    return [from, of, custom];
  }
}
export const viaThreeDecl = ThreeDecl.m();

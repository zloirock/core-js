import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// SIBLING declarators in one declaration each remap independently: the split of the
// first must not derail the later `this` reads (a stale re-visit of the replaced subtree
// walks detached ancestors); the unresolved key keeps its residual read
class ThreeDecl extends Array {
  static m() {
    const from = _Array$from;
    const of = _Array$of;
    const {
      custom
    } = this;
    return [from, of, custom];
  }
}
export const viaThreeDecl = ThreeDecl.m();
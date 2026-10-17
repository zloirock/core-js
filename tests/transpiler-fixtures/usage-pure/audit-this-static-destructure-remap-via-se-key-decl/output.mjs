import _Array$of from "@core-js/pure/actual/array/of";
// The declarator captures this, then evaluates the computed-key effect and binds the
// pure static at that property slot. The parameter default keeps the proven string key
// in its synthesized literal.
let ticks = 0;
class SeKeyDecl extends Array {
  static m() {
    const _ref = this,
      o = null == _ref ? _ref[""] : (ticks++, _Array$of);
    return o;
  }
}
export const viaSeKeyDecl = SeKeyDecl.m();
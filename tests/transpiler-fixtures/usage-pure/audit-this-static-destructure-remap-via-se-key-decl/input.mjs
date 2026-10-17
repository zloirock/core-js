// The declarator captures this, then evaluates the computed-key effect and binds the
// pure static at that property slot. The parameter default keeps the proven string key
// in its synthesized literal.
let ticks = 0;
class SeKeyDecl extends Array {
  static m() { const { [(ticks++, 'of')]: o } = this; return o; }
}
export const viaSeKeyDecl = SeKeyDecl.m();

// an arrow-param IIFE default routes through the same synth; a class expression is a
// static context like a declaration; a member-expression heritage resolves through the
// namespace object
class ArrowIife extends Array {
  static m() { return (({ of: viaArrow } = this) => viaArrow)(); }
}
export const viaArrowIife = ArrowIife.m();

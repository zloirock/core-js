import _Array$of from "@core-js/pure/actual/array/of";
// an arrow-param IIFE default routes through the same synth; a class expression is a
// static context like a declaration; a member-expression heritage resolves through the
// namespace object
class ArrowIife extends Array {
  static m() {
    return (({
      of: viaArrow
    } = {
      of: _Array$of
    }) => viaArrow)();
  }
}
export const viaArrowIife = ArrowIife.m();
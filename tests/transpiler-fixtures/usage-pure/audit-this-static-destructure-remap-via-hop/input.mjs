// negatives: a nested pattern HOPS through the static (the leaf is not the static surface);
// a nullish-wrapped init is not a bare `this`
class HopStatic extends Array {
  static m() { const { from: { length } } = this; return length; }
}
export const viaHop = HopStatic.m();

class Basic extends Array {
  static m() { const { from } = this; return from; }
}
export const viaBasic = Basic.m();

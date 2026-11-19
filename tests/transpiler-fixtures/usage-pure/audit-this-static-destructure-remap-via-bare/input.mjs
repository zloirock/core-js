class Bare {
  static m() { const { from } = this; return from; }
}
export const viaBare = Bare.m();

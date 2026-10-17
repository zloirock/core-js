class Shadowed extends Promise {
  static any() { return 1; }
  static m() { const { any } = this; return any; }
}
export const viaShadowed = Shadowed.m();

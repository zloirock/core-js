// negatives: an own static shadows the key; an instance method's `this` is not the
// constructor; a bare class has no inherited static surface
class Shadowed extends Array {
  static from() { return 1; }
  static m() { const { from } = this; return from; }
}
export const viaShadowed = Shadowed.m();

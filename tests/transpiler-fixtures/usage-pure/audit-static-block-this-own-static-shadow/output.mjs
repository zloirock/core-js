// `C` overrides `from` as its own static - `isShadowedByClassOwnMember` sees the override
// in the static-names set for this class body and bails. polyfill would otherwise bypass
// the user's deliberate replacement
class C extends Array {
  static from(x) {
    return [x, x];
  }
  static {
    this.from(1);
  }
}
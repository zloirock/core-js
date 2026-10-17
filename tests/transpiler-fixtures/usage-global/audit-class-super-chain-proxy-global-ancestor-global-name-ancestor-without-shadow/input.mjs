class Twin extends globalThis.Array {}
// the same chain with no local shadow at all: the control that pins the shadow as the only variable
export function globalNameAncestorWithoutShadow() {
  class Sub extends Twin {
    static items = [1, 2, 3];
    static grab() {
      return super.make;
    }
  }
  return Sub.items.includes("x");
}

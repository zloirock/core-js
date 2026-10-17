// a computed string-literal key still counts as an own-static shadow
class ComputedShadow extends Array {
  static ['from']() {
    return 1;
  }
  static m() {
    const {
      from
    } = this;
    return from;
  }
}
export const viaComputedShadow = ComputedShadow.m();
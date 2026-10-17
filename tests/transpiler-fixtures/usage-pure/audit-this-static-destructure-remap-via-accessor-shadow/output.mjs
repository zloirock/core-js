class AccessorShadow extends Array {
  static get of() {
    return 1;
  }
  static m() {
    const {
      of
    } = this;
    return of;
  }
}
export const viaAccessorShadow = AccessorShadow.m();
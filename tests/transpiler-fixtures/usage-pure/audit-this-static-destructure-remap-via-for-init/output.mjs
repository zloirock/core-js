import _Array$from from "@core-js/pure/actual/array/from";
// a for-init declarator (with a sibling) routes through the same split-safe path
class ForInit extends Array {
  static m() {
    for (let from = _Array$from, i = 0; i < 1; i++) {
      return [from, i];
    }
  }
}
export const viaForInit = ForInit.m();
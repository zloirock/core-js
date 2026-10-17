// a for-init declarator (with a sibling) routes through the same split-safe path
class ForInit extends Array {
  static m() {
    for (let { from } = this, i = 0; i < 1; i++) { return [from, i]; }
  }
}
export const viaForInit = ForInit.m();

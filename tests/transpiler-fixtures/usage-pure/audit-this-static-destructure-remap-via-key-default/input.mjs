class KeyDefault extends Array {
  static m() { const { from = 1 } = this; return from; }
}
export const viaKeyDefault = KeyDefault.m();

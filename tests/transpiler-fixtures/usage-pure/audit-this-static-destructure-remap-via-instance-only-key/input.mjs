// an INSTANCE-only key (`at` lives on the prototype, not the static surface) does not
// resolve as an inherited static - the destructure stays verbatim, no import
class InstanceOnlyKey extends Array {
  static m() { const { at } = this; return at; }
}
export const viaInstanceOnlyKey = InstanceOnlyKey.m();

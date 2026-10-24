let beats = 0;
class SeKeyParam extends Array {
  static m({ [(beats++, 'from')]: f } = this) { return f; }
}
export const viaSeKeyParam = SeKeyParam.m();

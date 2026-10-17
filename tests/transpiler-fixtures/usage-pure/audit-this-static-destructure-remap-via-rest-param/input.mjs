class RestParam extends Array {
  static m({ from, ...rest } = this) { return [from, rest]; }
}
export const viaRestParam = RestParam.m();

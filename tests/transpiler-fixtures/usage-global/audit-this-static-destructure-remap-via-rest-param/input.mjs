// a rest-bearing param default still injects - the read reaches the patched global even
// though pure must bail on this form
class RestParam extends Array {
  static m({ of, ...rest } = this) { return [of, rest]; }
}
export const viaRestParam = RestParam.m();

import _Array$from from "@core-js/pure/actual/array/from";
let beats = 0;
class SeKeyParam extends Array {
  static m({
    [(beats++, 'from')]: f
  } = {
    "from": _Array$from
  }) {
    return f;
  }
}
export const viaSeKeyParam = SeKeyParam.m();
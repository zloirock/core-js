import _Array$from from "@core-js/pure/actual/array/from";
class KeyDefault extends Array {
  static m() {
    const from = _Array$from;
    return from;
  }
}
export const viaKeyDefault = KeyDefault.m();
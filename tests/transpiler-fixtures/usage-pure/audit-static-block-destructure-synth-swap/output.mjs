import _Array$from from "@core-js/pure/actual/array/from";
// static initialization block destructures `Array.from`. plugin walks into static
// blocks the same way it walks into static methods - the destructure binding `from`
// is recognized and replaced with the polyfill alias. shows static-block scope is
// not a synth-swap barrier
class C {
  static {
    const from = _Array$from;
    C.fromFn = from;
  }
}
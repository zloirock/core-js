import _Array$from from "@core-js/pure/actual/array/from";
// `this` in a static method behaves like super for inherited-static lookup; computed
// key with side-effect prefix must run before the polyfilled call
let log = 0;
function fn() {
  log++;
  return 'from';
}
class C extends Array {
  static m() {
    return (fn(), _Array$from)([1, 2, 3]);
  }
}
C.m();
log;
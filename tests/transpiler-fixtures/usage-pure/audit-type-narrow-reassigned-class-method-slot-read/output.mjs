import _at from "@core-js/pure/actual/instance/at";
// a class METHOD is a writable slot exactly like a function-valued field: `this.m = ...` puts a
// foreign function in it, and the declared body's return type no longer describes what a call
// yields. narrowing off that body would dispatch a type-specific helper onto the replacement's
// value and throw
class Overwritten {
  rows() {
    return [1, 2];
  }
  swap() {
    this.rows = () => "text";
  }
  read() {
    var _ref;
    return _at(_ref = this.rows()).call(_ref, 0);
  }
}
export const values = [new Overwritten().read()];
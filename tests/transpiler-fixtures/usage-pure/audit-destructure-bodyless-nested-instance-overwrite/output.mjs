import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// A nested-instance assignment in a bodyless control body keeps both its native capture and
// polyfill read conditional. Placing the read after the body would run it unconditionally.
declare const a: number[];
let flat;
if (cond) {
  [_ref] = [a];
  flat = _flatMaybeArray(_ref);
}
export { flat };
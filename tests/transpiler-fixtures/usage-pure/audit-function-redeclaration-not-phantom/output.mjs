import _at from "@core-js/pure/actual/instance/at";
function outer() {
  var _ref;
  function F() {
    return [1, 2, 3];
  }
  function F() {
    return 'str';
  }
  return _at(_ref = F()).call(_ref, 0);
}
export const r = outer();
import _at from "@core-js/pure/actual/instance/at";
function outer() {
  function inner() {
    var _ref;
    _at(_ref = getArr()).call(_ref, -1);
  }
}
var _atMaybeArray = require("@core-js/pure/actual/array/instance/at");
// in sloppy code a function a loop body declares is a `var` of the enclosing function as well, so the loop
// head reads it and narrows by what it returns; strict code keeps it in the body
function sloppy() {
  var _ref;
  for (var i = _atMaybeArray(_ref = f()).call(_ref, 0); !i;) {
    function f() {
      return [1];
    }
    i = f;
  }
  return i;
}
sloppy();
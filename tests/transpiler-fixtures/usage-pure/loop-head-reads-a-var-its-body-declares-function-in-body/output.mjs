import _includes from "@core-js/pure/actual/instance/includes";
export function functionInBody() {
  var _ref;
  for (var i = _includes(_ref = f()).call(_ref, 5); !i;) {
    function f() {
      return [5];
    }
    i = f;
  }
  return i;
}
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _Array$of from "@core-js/pure/actual/array/of";
import _includes from "@core-js/pure/actual/instance/includes";
// a `var` a loop body declares hoists past the loop, so the head - its init, or its test inside a closure a
// parameter list holds - reads that binding and its array. a `let`, a class or a strict function the body
// declares stays in the body, and the head reads the outer name. a different method per row, each one
// several receiver types carry
export function forInit() {
  for (var i = _atMaybeArray(a1).call(a1, 0); !i;) {
    var a1 = [1];
    i = 1;
  }
  return i;
}
export function closureInParameters(run = () => {
  for (var i = 0; i < 1 && _valuesMaybeArray(a2).call(a2); i++) {
    var a2 = [2];
  }
}) {
  return run();
}
const s1 = 'ab';
export function letInBody() {
  for (var i = s1.slice(-1); !i;) {
    let s1 = [3];
    i = s1;
  }
  return i;
}
const K = Array;
export function classInBody() {
  for (var i = _Array$of(4); !i;) {
    class K {}
    i = K;
  }
  return i;
}
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
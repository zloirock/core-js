import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
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
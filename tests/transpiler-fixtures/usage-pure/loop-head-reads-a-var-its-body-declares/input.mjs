// a `var` a loop body declares hoists past the loop, so the head - its init, or its test inside a closure a
// parameter list holds - reads that binding and its array. a `let`, a class or a strict function the body
// declares stays in the body, and the head reads the outer name. a different method per row, each one
// several receiver types carry
export function forInit() {
  for (var i = a1.at(0); !i;) {
    var a1 = [1];
    i = 1;
  }
  return i;
}
export function closureInParameters(run = () => {
  for (var i = 0; i < 1 && a2.values(); i++) {
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
  for (var i = K.of(4); !i;) {
    class K {}
    i = K;
  }
  return i;
}
export function functionInBody() {
  for (var i = f().includes(5); !i;) {
    function f() { return [5]; }
    i = f;
  }
  return i;
}

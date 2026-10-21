import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims.
function f() {
  log();
  return _Map;
}
function g() {
  log();
  return _Promise;
}
function h(o) {
  const {
    A: {
      B: {
        groupBy: s
      }
    } = {
      B: f()
    }
  } = o;
  const {
    P: [{
      try: t
    }] = [g()]
  } = o;
  return [s, t];
}
use(h);
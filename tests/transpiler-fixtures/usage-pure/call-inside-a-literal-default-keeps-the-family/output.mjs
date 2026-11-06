import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// Calls inside literal-container defaults run only when those defaults fire.
// Native static reads require full Map and Promise entries for the returned constructors.
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
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a CALL spelled inside a container-literal default (`= { B: f() }`, `= [f()]`) runs only where the
// default fires, and the static read through its value is mirrored beside it; the census keeps the
// constructor family for the value the call returns, so it is not narrowed to an entry that lacks it
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
      B: (f(), {
        groupBy: _Map$groupBy
      })
    }
  } = o;
  const {
    P: [{
      try: t
    }] = [(g(), {
      try: _Promise$try
    })]
  } = o;
  return [s, t];
}
use(h);
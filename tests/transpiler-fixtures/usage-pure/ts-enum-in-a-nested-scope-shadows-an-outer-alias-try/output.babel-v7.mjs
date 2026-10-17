import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
const P = _Promise;
function f() {
  enum P {
    allSettled = 1,
  }
  return P.allSettled;
}
use(f(), _Promise$try(g));
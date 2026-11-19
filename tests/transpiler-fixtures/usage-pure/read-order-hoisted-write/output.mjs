import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A hoisted function can install a constructor before a textually earlier read.
let r;
let P = null;
init();
(P === _Promise ? _Promise$resolve : P.resolve.bind(P))(1);
r = typeof (P === _Promise ? _Promise$resolve : P.resolve);
function init() {
  P = _Promise;
}
use(r);
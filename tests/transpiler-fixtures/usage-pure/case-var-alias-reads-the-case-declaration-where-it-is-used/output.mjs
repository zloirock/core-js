import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a `var` a switch case declares holds what its initializer reads in the case - a name the case declares
// with `let` / `const` - wherever the `var` is read after the switch, an outer namesake of that name or
// none. the constructor reads load their families; distinct static per line
const A = Array;
switch (k) {
  case 1:
    let A = _Iterator;
    var M = A;
    const P = _Promise;
    var Q = P;
}
use((M === _Iterator ? _Iterator$from : M.from.bind(M))([1]), (Q === _Promise ? _Promise$try : Q.try.bind(Q))(f));
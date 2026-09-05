import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a collapse-REBUILT receiver spine (no source span) is not a read the source performed:
// its effect prefix splices as one ordered unit and the environment-root tail drops
// (`r = _globalThis, c++;` - babel's spelling); a ctor leaf the collapse folded into the
// tail stays as the throw probe (the sibling fixture's `a6 = ..., _Symbol;` canon)
let r;
let c = 0;
r = _globalThis, c++;
const of = _Array$of;
use(of, r, c);
let r2;
r2 = _globalThis, c++;
const from = _Array$from;
use(from, r2, c);
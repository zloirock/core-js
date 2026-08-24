// a collapse-REBUILT receiver spine (no source span) is not a read the source performed:
// its effect prefix splices as one ordered unit and the environment-root tail drops
// (`r = _globalThis, c++;` - babel's spelling); a ctor leaf the collapse folded into the
// tail stays as the throw probe (the sibling fixture's `a6 = ..., _Symbol;` canon)
let r;
let c = 0;
const { of } = (r = globalThis)[(c++, "self")].Array;
use(of, r, c);
let r2;
const { from } = (r2 = globalThis)[(c++, "self")].Array;
use(from, r2, c);

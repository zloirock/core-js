// a TS enum declared in a block, a function body, a class static block, a switch case or a loop body
// shadows an outer alias of a constructor there: a read in that scope reads the enum, while the alias read
// outside it keeps the constructor's static. the alias declarations load their constructors' families and
// the loop the iteration modules; distinct static per line
const M = Map;
const P = Promise;
const O = Object;
const I = Iterator;
const A = Array;
{
  enum M { groupBy = 1 }
  use(M.groupBy);
}
function f() {
  enum P { allSettled = 1 }
  return P.allSettled;
}
class K {
  static {
    enum O { groupBy = 1 }
    use(O.groupBy);
  }
}
switch (k) {
  case 1:
    enum I { from = 1 }
    use(I.from);
}
for (const x of xs) {
  enum A { of = 1 }
  use(A.of);
}
use(f(), P.try(g));

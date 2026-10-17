const P = Promise;
function f() {
  enum P { allSettled = 1 }
  return P.allSettled;
}
use(f(), P.try(g));

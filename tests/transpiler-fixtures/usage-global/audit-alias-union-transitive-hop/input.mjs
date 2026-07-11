// the usage-global union follows the INIT-alias hop even when the alias itself is
// reassigned: the no-own-write runtime path (`d` false) still holds the init source's
// reachable values, so M0's `c`-true target must inject alongside M's own reassignment
function f(c, d) {
  let M0 = Object;
  if (c) M0 = Array;
  let M = M0;
  if (d) M = Map;
  M.from([1, 2, 3]);
}
f(true, false);

// a mutually-aliased pair terminates via the seen-guard and still reaches the reassignment
// target through the live leg
let A = B;
let B = A;
if (x) A = Iterator;
A.from([1]);

// a TWO-hop alias chain reaches the source's reachable values through both hops
function g(c, d) {
  let N0 = Object;
  if (c) N0 = Array;
  let N1 = N0;
  let N2 = N1;
  if (d) N2 = Map;
  N2.of(1);
}
g(true, false);

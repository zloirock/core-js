// usage-pure outer polyfilled method whose receiver is a `||` with the same polyfilled
// sub-expression in both branches, asymmetrically nested (`(A.flat() || A.flat().at(0)).flat()`):
// same nth-recovery root as the conditional case - the shallow branch's slot must not be
// re-targeted by the deeper branch. regression lock
function f(A) {
  return (A.flat() || A.flat().at(0)).flat();
}
f;

// usage-pure outer polyfilled method whose receiver is a conditional with the SAME polyfilled
// sub-expression in both branches, asymmetrically nested (`(c ? A.flat() : A.flat().at(0)).flat()`):
// the shallow branch's slot must not be re-targeted by the deeper branch's nth-recovery, or the
// compose corrupts a sibling and a later locate crashes. regression lock
function f(c, A) {
  return (c ? A.flat() : A.flat().at(0)).flat();
}
f;

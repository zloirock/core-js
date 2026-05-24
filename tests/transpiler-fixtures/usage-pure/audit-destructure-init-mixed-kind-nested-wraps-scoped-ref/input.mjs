// outer arrow EXPRESSION body (kind=arrow) wraps a SE whose left side contains an inner
// bodyless `if (...) stmt` body-wrap (kind=stmt) with an instance polyfill registering a
// nested scopedVar. drainage returns ONE outermost wrap (the arrow's body SE) absorbing
// the inner stmt-wrap via recursive compose, which in turn absorbs the scopedVar at the
// converted block. pins kind=arrow + kind=stmt cohabiting in a single composed text
const { from } = ((() => (
  ((() => { if (Math.random() < 0) [1].at(0); return 'inner'; })(), [2].at(0))
))(), Array);
console.log(from);

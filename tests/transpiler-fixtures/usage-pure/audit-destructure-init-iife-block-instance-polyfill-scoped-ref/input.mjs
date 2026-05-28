// destructure init = SE-tail-to-known-static (`(..., Array).from`) so polyfill fires on
// the outer destructure. SE prefix = nested IIFE whose OUTER arrow has EXPRESSION body
// (registers a body-wrap inside the init range) wrapping an INNER arrow with BLOCK body
// containing `[1].at(0)` (registers a scoped `var _z;` decl inside the same range). the
// outer-polyfill replace must absorb the inner scoped var into the composed body-wrap
// text - otherwise the inner insert lands inside the outer's overwrite range and drops
const { from } = ((() => ((() => { var z = [1, 2, 3].at(0); return z; })(), [4, 5, 6].at(0)))(), Array);
console.log(from);

// chained polyfilled-static feeding a polyfilled instance: `Array.from(x).at(0)` composes
// an outer transform on `Array.from` with an inner transform on `.at`. the inner overwrite
// physically crosses the split prefix mid (the `).` between substituted receiver and the
// instance member) but stays safe. distinct methods per line lock every dispatch shape.
const r1 = Array.from(x).at(0);
const r2 = Array.from(y).flat();
const r3 = Array.from(z).includes(1);

// chained polyfilled-static feeding into a polyfilled instance: `Array.from(x).at(0)`
// composes an outer transform on `Array.from` with an inner transform on `.at`. the
// inner overwrite physically crosses the split prefix mid (the `).` between substituted
// receiver and the instance member). today's emit pipeline keeps this safe by gating
// canSplit on (no guard, no rootNode, not substituted); lock distinct methods per line
// so any future regression is visible across all instance-method dispatch shapes
const r1 = Array.from(x).at(0);
const r2 = Array.from(y).flat();
const r3 = Array.from(z).includes(1);

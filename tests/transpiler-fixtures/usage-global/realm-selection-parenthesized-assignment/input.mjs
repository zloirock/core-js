// A consumed assignment keeps its realm identity and serves both nested statics.
// Parentheses around the realm choice do not change either claim.
const G = globalThis;
let a, g;
const held = ({ Promise: { allSettled: a }, Map: { groupBy: g } } = (flag ? globalThis : G));
use(a, g, held === G);

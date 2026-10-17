// a side-effecting LEFT operand survives the swap verbatim - the effect still runs on the
// taken branch, and a truthy result keeps its own methods
let g2 = Math.random() < 0.5;
let eff = () => null;
let x3 = { Map: { groupBy: v => v } };
const { Map: { groupBy: mapGroupBy } } = g2 ? (eff() || globalThis) : x3;
export const viaSeLeft = mapGroupBy([1, 2], v => v % 2);

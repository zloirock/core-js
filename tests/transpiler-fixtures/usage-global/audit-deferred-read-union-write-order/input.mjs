// a write the PATH view cannot describe - a compound operator's result, a destructuring slot -
// only declines that view; the enumeration of reachable values runs on for the writes after it.
// writes are conditional so no single one is the receiver on its own, and the first row spans
// FAMILIES so the fold is observable: a single-family set would answer the same either way.
// distinct method per line so each row is attributable
let mixedFamilies = "a";
const readMixed = () => mixedFamilies.at(0);
if (flag) mixedFamilies += "b";
if (flag) mixedFamilies = ["c"];
export const a = readMixed();
let arraySlot = ["a"];
const readSlot = () => arraySlot.includes("b");
if (flag) [arraySlot] = [["b"]];
if (flag) arraySlot = ["c"];
export const b = readSlot();
let keyedSlot = ["a"];
const readKeyed = () => keyedSlot.flatMap(f);
if (flag) ({ keyedSlot } = { keyedSlot: ["b"] });
if (flag) keyedSlot = ["c"];
export const c = readKeyed();

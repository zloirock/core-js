// a write the PATH view cannot describe - a compound operator's result, an array or object
// destructuring slot - only declines that view; the enumeration of reachable values runs on for
// the writes after it. writes are conditional so no single one is the receiver on its own, and the
// first row spans FAMILIES so the widened helper is what a mixed set has to produce
let mixedFamilies = "a";
const readMixed = () => mixedFamilies.at(0);
if (flag) mixedFamilies += "b";
if (flag) mixedFamilies = ["c"];
export const a = readMixed();
let arraySlot = ["a"];
const readSlot = () => arraySlot.at(0);
if (flag) [arraySlot] = [["b"]];
if (flag) arraySlot = ["c"];
export const b = readSlot();
let keyedSlot = "a";
const readKeyed = () => keyedSlot.at(0);
if (flag) ({ keyedSlot } = { keyedSlot: "b" });
if (flag) keyedSlot = "c";
export const c = readKeyed();

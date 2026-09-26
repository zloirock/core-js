import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a write the PATH view cannot describe - a compound operator's result, an array or object
// destructuring slot - only declines that view; the enumeration of reachable values runs on for
// the writes after it. writes are conditional so no single one is the receiver on its own, and the
// first row spans FAMILIES so the widened helper is what a mixed set has to produce
let mixedFamilies = "a";
const readMixed = () => _at(mixedFamilies).call(mixedFamilies, 0);
if (flag) mixedFamilies += "b";
if (flag) mixedFamilies = ["c"];
export const a = readMixed();
let arraySlot = ["a"];
const readSlot = () => _atMaybeArray(arraySlot).call(arraySlot, 0);
if (flag) [arraySlot] = [["b"]];
if (flag) arraySlot = ["c"];
export const b = readSlot();
let keyedSlot = "a";
const readKeyed = () => _atMaybeString(keyedSlot).call(keyedSlot, 0);
if (flag) ({
  keyedSlot
} = {
  keyedSlot: "b"
});
if (flag) keyedSlot = "c";
export const c = readKeyed();
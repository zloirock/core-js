import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a transparent wrapper (paren / TS cast) between a member and its WRITE or TAG host must not
// defeat the position gates: the host's slot holds the wrapper, so identity checks climb to the
// slot-filling node. a substituted write target is an invalid assignment LHS; a substituted
// prototype tag receives the template strings array as its receiver. reads through the same
// wrappers keep polyfilling. distinct method per cell
const arr: number[] = [1, 2, 3];
arr.at = function () {
  return 0;
};
export const r1 = arr.at(0);
const brr: string[] = ["a"];
(brr.includes as any) = function () {
  return true;
};
export const r2 = brr.includes("a");
const crr: string[] = ["c"];
(crr.includes as any) += "y";
export const r3 = crr.includes("c");
const drr: number[] = [7];
(drr.at as any) = function () {
  return 2;
};
export const r4 = drr.at(1);
// prototype-method template tags stay raw through wrappers on both parsers
const trr: number[] = [1];
trr.at`lit`;
(trr.at as any)`lit`;
// a wrapped for-x write slot is a per-iteration rebind, never the inherited method
const frr: number[] = [];
for (frr.at of [[1]]) break;
export const r5 = frr.includes(1);
// cast-wrapped destructure-LHS slots are per-slot writes too - raw on both parsers, while
// independent reads of the same receivers keep the polyfill
const g1: number[] = [1];
({
  p: g1.at as any
} = {
  p: 1
});
export const r6 = g1.includes(1);
const g2: string[] = ["s"];
[g2.includes as any] = [3];
export const r7 = g2.at(0);
const g3: number[] = [2];
({
  q: (g3.at as any) = 2
} = {});
export const r8 = g3.includes(2);
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise from "@core-js/pure/actual/promise/constructor";
// an UNCLAIMED object-pattern destructure (no polyfillable prop) has no owner in the
// destructure pipeline, so its proxy-hop receiver collapses in place exactly like a
// non-destructure receiver - deferring would strand a raw `_globalThis['self']...`
// (undefined off-engine)
const {
  qq1
} = _globalThis.Array.prototype;
export const r1 = typeof qq1;
// dot-hop with a trailing member read
const {
  qq2
} = _Promise.prototype;
export const r2 = typeof qq2;
// hop leaf IS the destructure source (no trailing member)
const {
  qq3
} = _Map;
export const r3 = typeof qq3;
// assignment host
let qq4;
({
  qq4
} = _globalThis.Reflect);
export const r4 = typeof qq4;
// parameter default host
function pf({
  qq5
} = _globalThis.Number) {
  return typeof qq5;
}
export const r5 = pf();
// side-effecting computed hop key: the collapse harvests the key effect (runs once)
let se1 = 0;
const {
  qq6
} = (se1++, _Iterator).prototype;
export const r6 = [typeof qq6, se1];
// claimed control: a polyfillable sibling routes the pattern into the destructure
// pipeline, which extracts the static and collapses the residual receiver itself
const values = _Object$values;
const {
  qq7
} = _globalThis.Object;
export const r7 = [typeof values, typeof qq7];
// sequence-wrapped ROOT stays uncollapsed (root swap only, prefix effect in place) -
// matches the non-destructure canon for wrapped roots
let se2 = 0;
const {
  qq8
} = (se2++, _globalThis)['self'].JSON;
export const r8 = [typeof qq8, se2];
// an UNCLAIMED object-pattern destructure (no polyfillable prop) has no owner in the
// destructure pipeline, so its proxy-hop receiver collapses in place exactly like a
// non-destructure receiver - deferring would strand a raw `_globalThis['self']...`
// (undefined off-engine)
const { qq1 } = globalThis['self'].Array.prototype;
export const r1 = typeof qq1;
// dot-hop with a trailing member read
const { qq2 } = globalThis.self.Promise.prototype;
export const r2 = typeof qq2;
// hop leaf IS the destructure source (no trailing member)
const { qq3 } = globalThis['self'].Map;
export const r3 = typeof qq3;
// assignment host
let qq4;
({ qq4 } = globalThis.self.Reflect);
export const r4 = typeof qq4;
// parameter default host
function pf({ qq5 } = globalThis.self.Number) {
  return typeof qq5;
}
export const r5 = pf();
// side-effecting computed hop key: the collapse harvests the key effect (runs once)
let se1 = 0;
const { qq6 } = globalThis[(se1++, 'self')].Iterator.prototype;
export const r6 = [typeof qq6, se1];
// claimed control: a polyfillable sibling routes the pattern into the destructure
// pipeline, which extracts the static and collapses the residual receiver itself
const { values, qq7 } = globalThis.self.Object;
export const r7 = [typeof values, typeof qq7];
// sequence-wrapped ROOT stays uncollapsed (root swap only, prefix effect in place) -
// matches the non-destructure canon for wrapped roots
let se2 = 0;
const { qq8 } = (se2++, globalThis)['self'].JSON;
export const r8 = [typeof qq8, se2];

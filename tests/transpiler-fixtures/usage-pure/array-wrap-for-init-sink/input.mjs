// Array-wrapped destructures in a for-init header retain receiver effects and stores.
// A side-effecting neighbor element is evaluated before the pattern reads its selected slot.
// Pure static bindings and instance reads must both preserve that order.
const seen = [];
const eff = t => (seen.push(t), t);
const xs = [1];
let kw;
let out1, out2, out3;
for (const [{ Object: { defineProperty } }] = [(eff('p'), globalThis), 7]; !out1;) out1 = defineProperty;
for (const [{ Object: { defineProperties } }] = [kw = (eff('q'), globalThis)]; !out2;) out2 = defineProperties;
for (const [{ Object: { getOwnPropertyNames } }] = [globalThis, eff('s')]; !out3;) out3 = getOwnPropertyNames;
// A reading claim captures the stored wrapper element before dispatching, so the store
// and its effect run once in the loop header.
let out4;
for (const [{ Array: { prototype: { at: soleAt } } }] = [kw = (eff('t'), globalThis)]; !out4;) out4 = soleAt;
export { out1, out2, out3, out4, seen, kw };

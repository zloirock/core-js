// the FOR-INIT sink: a value-dead pure extra sheds with the brackets, a kept write rides the
// sole extraction ahead of the pure it binds - one declarator in the header either way - and an
// EFFECTFUL neighbour keeps the wrapper native in the header, where the loop cannot host a lift
const seen = [];
const eff = t => (seen.push(t), t);
const xs = [1];
let kw;
let out1, out2, out3;
for (const [{ Object: { defineProperty } }] = [(eff('p'), globalThis), 7]; !out1;) out1 = defineProperty;
for (const [{ Object: { defineProperties } }] = [kw = (eff('q'), globalThis)]; !out2;) out2 = defineProperties;
for (const [{ Object: { getOwnPropertyNames } }] = [globalThis, eff('s')]; !out3;) out3 = getOwnPropertyNames;
// a READING claim over a STORED element dispatches on what the write stored, riding the write
// inside its dispatch
let out4;
for (const [{ Array: { prototype: { at: soleAt } } }] = [kw = (eff('t'), globalThis)]; !out4;) out4 = soleAt;
export { out1, out2, out3, out4, seen, kw };

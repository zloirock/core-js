// the cast-seal probes ride the CLAIM, DESTRUCTURE and SYNTH channels too (erasure keeps
// the paren seal; the throw probe re-emits the sealed read, the key SE runs on it once)
let c2 = 0;
export function castSealSynth({ values: sv } = (globalThis.window?.[(c2++, 'self')] as any).Object) { return sv; }
export { c2 };

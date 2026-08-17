// TS wrappers across the probe nav: a BARE wrapper (`!`, an unparenthesized cast position)
// erases without breaking the chain - the short-circuit survives and the value canon renders
// the guarded ponyfill; a PARENTHESIZED layer seals - the member above it parses PLAIN and
// the render keeps the source's throw semantics. distinct methods per line
let c = 0;
export const bareNonNullHop = globalThis.window?.[(c++, 'self')]!.Number;
export const bareNonNullMidChain = globalThis.window?.self!.window?.Array.of(2).flat();
export const castSealValueUse = (globalThis.window?.self as any).Math;
export const parenSealPlainRead = (globalThis.window?.self).JSON;
export const castSealDelete = delete (globalThis.window?.self.customProp as any);

// the cast-seal probes ride the CLAIM, DESTRUCTURE and SYNTH channels too (erasure keeps
// the paren seal; the throw probe re-emits the sealed read, the key SE runs on it once)
let c2 = 0;
export const castSealClaim = (globalThis.window?.self as any).Array.of(6).at(0);
export const { keys: castSealDestructure } = (globalThis.window?.self as any).Object;
export function castSealSynth({ values: sv } = (globalThis.window?.[(c2++, 'self')] as any).Object) { return sv; }
export { c2 };

// the bare-`!` KEPT-ASSIGN spelling stays raw on BOTH legs (the kept canon owns the write; the
// wrapper neither seals nor unlocks a collapse). its VALUE twin has no write to keep, so the
// short-circuit render owns it and the hop resolves to its ponyfill instead of being read raw
let kv;
export const bareNonNullKeptAssign = (kv = globalThis.window?.self!.window)?.BigInt;
export const bareNonNullKeptValue = globalThis.window?.self!.window;
export { c };

// a CAST-sealed SE-key destructure source: the wrapper peels transparently, the residual
// rides the guard exactly like the paren-sealed spelling
let c3 = 0;
export const { [(c3++, 'freeze')]: castSealSeKeyResidual } = ((globalThis.window?.self) as any).Object;
export { c3 };

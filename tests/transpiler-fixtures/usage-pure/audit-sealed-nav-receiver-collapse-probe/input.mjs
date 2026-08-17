// a SEALED probe nav under a claim the RECEIVER channel erases: `(nav).Map` collapses to the
// ponyfill ctor and the dispatch above reads off it, dropping the read the source performs on the
// sealed value. that read comes back as a throw probe, the same one the claim channel emits for
// every shape that keeps its receiver - the rows below enumerate both families
export const instanceOnCtor = (globalThis.window?.self).Map.name;
export const instanceOnOtherCtor = (globalThis.window?.self).Promise.name;
export const instanceThroughTail = (globalThis.window?.self).Map.name.length;
export const instanceDispatch = (globalThis.window?.self).Map.name.at(0);

// the consumers that always kept the probe - one per shape family. `prototypeRead` is the one
// that routes through the kept-nav render rather than the erase: a claim sitting BELOW the chain
// end belongs to the erase channel, which swaps it and re-emits the read, where the nav render
// would spell the guard and leave `Map` native - the realm's prototype, not the ponyfill's
export const prototypeRead = (globalThis.window?.self).Map.prototype;
export const ctorLength = (globalThis.window?.self).Map.length;
export const staticCall = (globalThis.window?.self).Array.of(1);
export const ctorStatic = (globalThis.window?.self).Number.MAX_SAFE_INTEGER;
export const viaIntermediate = (globalThis.window?.self).Map;

// a seal over a nav that ENDS AT the claim has no hop leaf for the nav plan to render, so the
// guard is built from the erase verdict's own `?.` object with the claim's ponyfill as the
// always-defined alternate - the read the seal makes observable survives either way
export const sealedNavEndingAtClaim = (globalThis.window?.self.Promise).resolve;

// a WRITE host is a member access like any other: the seal keeps its read, so the collapse may
// not retarget it at the live realm global (it wrote there and swallowed the throw)
export function writeHost(v) {
  (globalThis.self.window?.self).Box = v;
}
export const deleteHost = () => delete (globalThis.self.window?.self).Box;

// a leaf core-js ponyfills no constructor for has no binding to stand in as the always-defined
// alternate, so the guard reads off the global's own name - the claim beside it still polyfills
export const unponyfilledCtorLeaf = (globalThis.window?.Array).of(1);

// an effect the source wrote BEFORE the nav runs before the read the probe reproduces: a sequence
// prefix is not part of the guarded value and may not migrate behind it
export let seq = 0;
export const prefixAheadOfProbe = ((seq++, globalThis.window?.self)).Array.of(1);

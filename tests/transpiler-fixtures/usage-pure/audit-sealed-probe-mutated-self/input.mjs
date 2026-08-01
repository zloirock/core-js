// a MUTATED `self` slot deopts the sealed probe forms FILE-WIDE (the slot write makes every
// `self` read the user's replacement): the synth default, the claim and the destructure all
// keep the raw sealed read - substituting a pony would bypass the mutation. isolated file:
// the deopt is file-scoped by design, and would kill probe fixtures sharing the module
globalThis.self = globalThis.self;
export function viaSealedMutatedSynth({ getPrototypeOf: dm1 } = (globalThis.window?.self).Object) { return dm1; }
export const viaSealedMutatedClaim = (globalThis.window?.self).Object.keys;
export const { entries: viaSealedMutatedDestructure } = (globalThis.window?.self).Object;

// every OTHER channel deopts the same way: proto-method call (the unmutated `Map` argument
// still claims), fallback static, kept-assign, delete - raw sealed read, substituted root
export const viaSealedMutatedProto = (globalThis.window?.self).Map.prototype.has.call(new Map(), 1);
export const viaSealedMutatedFallback = (globalThis.window?.self).Promise.noSuchStatic;
let d;
export const viaSealedMutatedKept = (d = globalThis.window?.self).Array;
export const viaSealedMutatedDelete = delete (globalThis.window?.self).customProp;

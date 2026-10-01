// the guarded object of a live `?.` is found by walking DOWN to the hop whose value can be undefined,
// and that walk stops only at a seal hiding a SHORT-CIRCUIT: a seal over a plain nav hides nothing the
// value canon does not already answer, so the walk goes through it and the chain collapses like its
// unsealed twin. the stop is asked of the shared predicate, not of the node type: babel's default
// parser records parens as a flag where the other dialect makes them a NODE, and reading the type
// gave one source two guard shapes - the emitters then disagreed on whether it throws.
let n = 0;
export const optionalCallThroughSeal = (globalThis.window).self.Array?.of(5);
export const optionalCallDeeperSeal = ((globalThis.window).self).Array?.of(5);
export const optionalMemberThroughSeal = (globalThis.window).self.Array?.prototype;
export const optionalCallSeqSeal = ((n++, globalThis.window)).self.Array?.of(5);
// the TEST is a render, and the engine used to leave it in the tree for the visitors: a claim then
// collapsed it to the leaf ponyfill (`null == _Promise`), erasing the read the seal makes observable
export const sealedNavUnderOptionalClaim = (globalThis.window.self)?.Promise?.resolve(1);
// and without a probe under the seal the test takes the plan's own VALUE - `self` is an erasable
// realm reference, so keeping `_globalThis.self.window` read a native `self` where `_self` is the point
export const erasableHopUnderSeal = (globalThis.self).window?.Array.of(5);
// NEGATIVE: no seal - the walk reaches the environment probe and guards on it, as it always did
export const noSeal = globalThis.window.self.Array?.of(5);
// TWO live `?.` over ONE sealed value: both take their undefinedness from that same read, so one
// test expresses the union - counted as two sources it stood the claim DOWN and left `Promise.resolve`
// native, which is the one answer usage-pure may never give
export const twoOptionalsOneSeal = ((globalThis.window)).self?.Promise?.resolve(1);
export const twoOptionalsOneSealCtor = ((globalThis.window)).self?.Array?.of(5);
export const twoOptionalsSeqSeal = ((n++, globalThis.window)).self?.Promise?.resolve(1);
// NEGATIVE: no live `?.` at all - the claim erases the whole navigation
export const noOptional = (globalThis.window).self.Array.of(5);

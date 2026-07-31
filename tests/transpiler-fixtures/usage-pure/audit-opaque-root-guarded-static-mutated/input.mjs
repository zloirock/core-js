// a MUTATED static must never collapse onto the ponyfill through the opaque-root guard path:
// the runtime surface carries the user's patch, so the guarded branch keeps reading off the
// memoized ref (patch-wins). separate file - the mutation deopts its pair file-wide
globalThis.Array.of = function patched() { return ['p']; };
const f = () => globalThis;
export const patchedCallKeepsRef = f()?.window?.Array.of(5).at(0);
globalThis.Number.MAX_SAFE_INTEGER = 5;
const g = () => globalThis;
export const patchedFieldKeepsRef = g()?.window?.Number.MAX_SAFE_INTEGER.toFixed(0);

// a MUTATED proxy-global slot hop (`globalThis.self`) is no longer pristine: the chain keeps
// the raw guarded read (patch-wins), no ponyfill collapse
globalThis.self = { window: { Array: { of: x => [x, 'fake'] } } };
const m = () => globalThis;
export const mutatedHopKeepsRef = m()?.self?.window?.Array.of(4).at(0);

// a MUTATED slot hop under an IDENTITY-IIFE root keeps the raw guarded read (patch-wins) -
// the identity proof does not bypass the pristine gate
export const identityMutatedHopKeepsRef = ((x) => x)(globalThis)?.self?.window?.Array.of(6).at(0);

// a MUTATED slot in the REMAINDER of a proxy nav forbids the leading-hop drop: past the
// user-replaced hop the value is the user's object, so the chain keeps its raw spelling and
// the live `?.` short-circuit (patch-wins)
globalThis.self = { window: { Array: { of: x => [x, 'fake'] } } };
export const mutatedRemainderKeepsNav = globalThis.window?.self.window?.Array.of(7).at(0);

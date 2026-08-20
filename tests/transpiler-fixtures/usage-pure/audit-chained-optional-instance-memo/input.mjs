// two OPTIONAL polyfilled dispatches in a row: the outer memoizes the whole inner call as its
// root, so the inner's emit has to land in that memo's VALUE slot. once a nested rewrite has
// already reshaped the slot no source-derived needle survives there, and the fallback shape -
// the bare guard ref - matches the memo's own LHS instead, spelling an assignment TO the emit
// (output that does not parse at all)
globalThis.chainBox = { list: ['ab', 'cd'], str: 'a-a' };
export const flatThenAt = globalThis.chainBox.list?.at(0)?.at(0);
export const replaceThenAt = globalThis.chainBox.str?.replaceAll('a', 'z')?.at(0);
export const overNav = globalThis.window?.self.chainBox.list?.at(0)?.at(0);
export const threeDeep = globalThis.chainBox.list?.at(0)?.slice(0, 2)?.at(0);

// the negatives that pin which shape needs the fallback: a MEMBER tail past the first dispatch
// keeps a needle of its own, a non-optional second dispatch never memoizes, and a LOCAL receiver
// leaves the raw source in place for the plain needle to find
export const flatThenLength = globalThis.chainBox.list?.at(0)?.length;
export const flatThenPlainAt = globalThis.chainBox.list?.at(0).at(0);
const localArr = [3, [1, 2]];
export const localChain = localArr?.at(0)?.at(0);

// the same chain over a tail name this file never writes: the suppressed-hop render drive sees a
// chain END that is a dispatch CALLEE there, and rendering over it wraps the rebuilt call instead
// of the receiver - the invocation would lose its receiver and throw
export const overNavUnknown = globalThis.window?.self.unknownChain.list?.at(0)?.at(0);
export const overNavUnknownDeep = globalThis.window?.self.unknownChain.inner.list?.at(0)?.at(0);

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.chainBox.list ? 0 : 1)?.includes('a');

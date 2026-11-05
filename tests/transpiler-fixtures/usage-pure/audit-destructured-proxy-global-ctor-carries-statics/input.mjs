// Escaping constructor values from direct realm patterns retain their full static surface.
// Literal wrappers keep native extraction; nested hops and loop heads preserve their own capture rules.
const { Map } = globalThis;
const { Set: S } = globalThis;
const { self: { WeakMap } } = globalThis;
const { Promise = Object } = self;
const [{ WeakSet: W }] = [globalThis];
const { g: { Set: R } } = { g: globalThis };
export const held = [Map, S, WeakMap, Promise, W, R];
for (const { Symbol: Y } of [globalThis]) hand(Y);
for (const { self: { Iterator: I } } of [globalThis]) hand(I);

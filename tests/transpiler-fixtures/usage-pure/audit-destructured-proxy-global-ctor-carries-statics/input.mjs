// a constructor DESTRUCTURED off the proxy-global surface escapes exactly as a spelled-out read of
// that surface does: the slot pairs with a member the source never writes, so the pattern SLOT is
// what names the escape. every spelling of the pairing answers alike - shorthand, renamed, nested,
// defaulted, an array wrapper, and a for-of head, whose pattern pairs with the iterated element -
// flat and through a proxy hop, where the level is a synthesized read no position of its own names
const { Map } = globalThis;
const { Set: S } = globalThis;
const { self: { WeakMap } } = globalThis;
const { Promise = Object } = self;
const [{ WeakSet: W }] = [globalThis];
const { g: { Set: R } } = { g: globalThis };
export const held = [Map, S, WeakMap, Promise, W, R];
for (const { Symbol: Y } of [globalThis]) hand(Y);
for (const { self: { Iterator: I } } of [globalThis]) hand(I);

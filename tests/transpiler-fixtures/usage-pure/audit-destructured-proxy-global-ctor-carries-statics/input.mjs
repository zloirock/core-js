// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const { Map } = globalThis;
const { Set: S } = globalThis;
const { self: { WeakMap } } = globalThis;
const { Promise = Object } = self;
const [{ WeakSet: W }] = [globalThis];
const { g: { Set: R } } = { g: globalThis };
export const held = [Map, S, WeakMap, Promise, W, R];
for (const { Symbol: Y } of [globalThis]) hand(Y);
for (const { self: { Iterator: I } } of [globalThis]) hand(I);

// A constructor extracted from an overwritten RegExp slot keeps the user's replacement.
// Its later escape read stays native.
globalThis.RegExp = fake;
const [{ RegExp: RX }, { WeakMap: WM }] = [globalThis, globalThis];
export const viaMutatedKeySlot = RX.escape(text);

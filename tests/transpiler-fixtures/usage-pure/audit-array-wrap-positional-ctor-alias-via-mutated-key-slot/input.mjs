globalThis.RegExp = fake;
const [{ RegExp: RX }, { WeakMap: WM }] = [globalThis, globalThis];
export const viaMutatedKeySlot = RX.escape(text);

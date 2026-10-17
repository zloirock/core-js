globalThis.RegExp = fake;
const [{ RegExp: RX }, { WeakMap: WM }] = [globalThis, globalThis];
export const viaMutatedKeySibling = new WM(entries);

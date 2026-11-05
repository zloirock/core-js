// A write to the RegExp realm slot does not turn the neighbouring WeakMap slot into that replacement.
// Both wrapper extractions and the WeakMap construction stay native.
globalThis.RegExp = fake;
const [{ RegExp: RX }, { WeakMap: WM }] = [globalThis, globalThis];
export const viaMutatedKeySibling = new WM(entries);

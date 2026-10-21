// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
globalThis.RegExp = fake;
const [{ RegExp: RX }, { WeakMap: WM }] = [globalThis, globalThis];
export const viaMutatedKeySibling = new WM(entries);

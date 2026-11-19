// The escape selects the full Symbol index. Keeping its static read must not hide
// the captured protocol key from instance dispatch, even after the realm key changes.
consume(Symbol);
let realmKey = 'Symbol';
const { [realmKey]: Captured } = globalThis;
realmKey = 'Array';
const { iterator: key = fallback } = Captured;
export const method = [10, 11][key];

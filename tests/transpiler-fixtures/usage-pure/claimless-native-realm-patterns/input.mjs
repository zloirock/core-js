let realm, held;
export const stored = (realm = globalThis, held = realm.window.self)?.Number.MAX_SAFE_INTEGER.name;
export { held };
const { self: { [Symbol.iterator]: iterator } } = globalThis;
const { self: { Set: { name: nativeName } } } = globalThis;
const { self: { Set: { name }, Map: { groupBy } } } = globalThis;
const { self: { [Symbol.iterator]: iter, Map: { groupBy: group } } } = globalThis;
export { iterator, nativeName, name, groupBy, iter, group };

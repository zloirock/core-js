import _Map from "@core-js/pure/actual/map/constructor";
// `declare class Map<K, V>` is type-only - it adds an ambient type but no runtime
// binding. plugin must continue to polyfill `new Map()` since the host still needs
// the constructor at runtime; the declare modifier only affects TS type-checking
declare class Map<K, V> {
  foo(): void;
}
const m = new _Map<string, number>();
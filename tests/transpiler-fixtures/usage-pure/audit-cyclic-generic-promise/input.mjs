// self-wrap through a known container (`Promise`): outer `Promise<T>` is resolvable
// via resolveKnownContainerType, but inner `Nested<Promise<T>>` re-enters Nested's
// decl. without seen, Nested re-expands indefinitely; with seen, fallback to null.
// receiver narrows to null -> generic `_then` not in provider's static methods, so
// plugin stays conservative and doesn't inject (no polyfill)
type Nested<T> = Nested<Promise<T>>;
declare const n: Nested<string>;
n.at(0);

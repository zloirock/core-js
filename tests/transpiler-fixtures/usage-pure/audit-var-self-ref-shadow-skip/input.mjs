// `var Map = Map` shim pattern: the self-ref initializer is hoisted and reads the global
// binding, so both the constructor assignment and the subsequent `Map.groupBy(...)` call
// must be rewritten to their polyfill counterparts
var Map = Map;
Map.groupBy([1], x => x);

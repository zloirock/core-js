// `var Map = Map` shim pattern — after the self-ref var B2 fix the identifier visitor
// now polyfills both the Map constructor and the `Map.groupBy` static call. the rename
// was from `-shadow-skip` semantics (previously constructor was suppressed) to active
// coverage of a legitimate polyfill entry
var Map = Map;
Map.groupBy([1], x => x);

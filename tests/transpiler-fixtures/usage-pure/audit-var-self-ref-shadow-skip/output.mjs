import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// `var Map = Map` shim pattern — after the self-ref var B2 fix the identifier visitor
// now polyfills both the Map constructor and the `Map.groupBy` static call. the rename
// was from `-shadow-skip` semantics (previously constructor was suppressed) to active
// coverage of a legitimate polyfill entry
var Map = _Map;
_Map$groupBy([1], x => x);
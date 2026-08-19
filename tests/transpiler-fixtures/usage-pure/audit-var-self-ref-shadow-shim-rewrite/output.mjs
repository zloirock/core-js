import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// `var Map = Map` shim pattern: the self-ref initializer is hoisted and reads the global
// binding, so both the constructor assignment and the subsequent `Map.groupBy(...)` call
// must be rewritten to their polyfill counterparts
var Map = _Map;
(Map === _Map ? _Map$groupBy : Map.groupBy.bind(Map))([1], x => x);
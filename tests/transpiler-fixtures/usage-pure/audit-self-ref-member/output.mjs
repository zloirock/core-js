import _Map from "@core-js/pure/actual/map/constructor";
// `var Map = Map; Map.prototype.get` - self-referential var init to global `Map`
// together with prototype access. Plugin emits the Map constructor polyfill and
// rewrites both the init and the prototype member access to the pure import
var Map = _Map;
_Map.prototype.get;
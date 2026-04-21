import _Map from "@core-js/pure/actual/map/constructor";
// `var Map = Map; Map.prototype.get` — member-expr visitor already resolved via
// `resolveObjectName`. Now the identifier-visitor also catches `Map` in `var Map = Map`
// (self-ref var branch), so the constructor polyfill import is emitted alongside the
// already-detected `Map.prototype.get` instance access
var Map = _Map;
_Map.prototype.get;
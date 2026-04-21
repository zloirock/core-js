// `let Map = globalThis.Map; Map = CustomMap; Map.prototype.get` - constantViolations length > 0
// resolveBindingToGlobal bails, so `Map.prototype.get` doesn't polyfill (Map binding may be
// reassigned to a non-Map value). Conservative - prevents false positive
let Map = globalThis.Map;
Map = CustomMap;
Map.prototype.get;

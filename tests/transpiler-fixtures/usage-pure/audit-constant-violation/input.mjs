// `let Map = globalThis.Map; Map = CustomMap; Map.prototype.get` - because `Map` is
// reassigned after init, it may no longer refer to the real `Map`. Plugin
// conservatively skips the prototype polyfill here to avoid a false positive.
let Map = globalThis.Map;
Map = CustomMap;
Map.prototype.get;

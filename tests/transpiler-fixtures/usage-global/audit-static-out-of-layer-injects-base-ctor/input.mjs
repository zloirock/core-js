// `Map.from` is a recognized static whose module is out of the default `actual` layer, so usage
// resolution filters it to nothing. usage-global must still inject the base `Map` constructor so
// the receiver exists - the same suite an unrecognized `Map.foo` triggers, and what usage-pure
// already gives by substituting `_Map`. without it `Map.from(...)` throws `Map is not defined`
// rather than the in-layer `Map.from is not a function`
Map.from(arr);

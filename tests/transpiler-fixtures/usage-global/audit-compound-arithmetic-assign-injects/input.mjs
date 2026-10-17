// `Map += 1` - arithmetic compound assignment reads LHS before writing. usage-global must
// inject Map polyfill so the LHS read finds the constructor (otherwise ReferenceError on
// engines without native Map). semantics afterward are nonsense (`Map = Map + 1` makes Map
// a number) but the load-time polyfill is what prevents the ReferenceError
Map += 1;

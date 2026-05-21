// `declare const Map` is ambient (tsc elides it at runtime; references resolve to the
// global). raw `getBindingIdentifier` sees the declare-binding and suppresses the warning;
// `adapter.hasBinding` filters ambient shapes via `isAmbientBindingShape` and correctly
// reports `Map` as unshadowed - so `Map ||= Y` fires the diagnostic (the assignment hits
// the read-only polyfill import at runtime and throws)
declare const Map: any;
Map ||= { B: 2 };
console.log(Map);

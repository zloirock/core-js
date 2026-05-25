import _Map from "@core-js/pure/actual/map/constructor";
// `declare const Map` is ambient (tsc elides it at runtime; references resolve to the
// global). raw `binding-identifier lookup` sees the declare-binding and suppresses the warning;
// `adapter.hasBinding` filters ambient shapes via `ambient binding filter` and correctly
// reports `Map` as unshadowed - so `Map ||= Y` fires the diagnostic (the assignment hits
// the read-only polyfill import at runtime and throws)
declare const Map: any;
Map ||= {
  B: 2
};
console.log(_Map);
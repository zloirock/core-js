// catch parameter shadows a global: subsequent uses inside the catch body resolve to
// the local binding and skip pure-mode polyfill emission.
try {} catch (Map) { Map.groupBy([], x => x); }

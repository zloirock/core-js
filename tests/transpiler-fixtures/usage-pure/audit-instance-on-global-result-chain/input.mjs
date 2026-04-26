// instance call chained directly on a polyfilled-global call result: both the global
// call and the instance call get their own pure-mode polyfill aliases.
Array.from(x).at(0);

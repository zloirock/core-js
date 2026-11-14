// A disabled module specifier keeps its original entry load.
await import(
  "core-js/actual/promise" // core-js-disable-line
);

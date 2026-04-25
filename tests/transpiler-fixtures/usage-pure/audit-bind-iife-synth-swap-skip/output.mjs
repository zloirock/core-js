// design-limit: synth-swap's IIFE-arg classifier walks the call expression directly,
// not through `.bind` / `.call` indirection. `.bind(null)(Array)` looks like a bound
// function value being called - the static target lookup bails out and `from` stays
// as a plain destructure read. accepted under-polyfill for the edge pattern (DSY-12, DSY-14)
(function ({
  from
}) {
  return from([1, 2]);
}).bind(null)(Array);
(function ({
  keys
}) {
  return keys({
    a: 1
  });
}).call(null, Object);
// IIFE called with array spread containing holes `[a, , b]`: the iteration protocol
// must be polyfilled and the holes preserved through the spread.
(({
  from
}) => from([1, 2, 3]))(...[, Array]);
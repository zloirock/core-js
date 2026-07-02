// receiver-rewrite bails when the IIFE caller-arg is `null`: `(({from}) => from)(null)`.
// Null isn't a classifiable receiver identifier, so the plugin doesn't know which static
// methods to bind. Per-key destructure-default doesn't fire either (no `= R` slot).
// At runtime, destructuring null throws TypeError - the user code is a bug, so the
// plugin emits it as-is
(({
  from
}) => from)(null);
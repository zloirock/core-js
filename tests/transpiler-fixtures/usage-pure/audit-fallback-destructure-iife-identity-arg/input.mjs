// pure-version of identity IIFE: `(arg => arg)(Array)` -- pass-through that resolves
// to its argument. `Result` becomes `Array`, the destructured `from` is `Array.from`,
// rewrite emits `_Array$from` directly (no fallback needed). distinct from the
// conditional cases where `fromFallback` keeps the destructure inline.
const Result = (arg => arg)(Array);
const { from } = Result;
from([1, 2]);

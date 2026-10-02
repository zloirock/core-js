import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// A supplied argument can override the array default, and an escaped function has unknown callers.
// Global injection keeps both families; pure only rewrites the default receiver.
function f({
  at
} = {
  at: _atMaybeArray([[1, 2]][0])
}) {
  return at;
}
use(f("ab"));
function g({
  includes
} = {
  includes: _includesMaybeArray([1, 2])
}) {
  return includes;
}
use(g);
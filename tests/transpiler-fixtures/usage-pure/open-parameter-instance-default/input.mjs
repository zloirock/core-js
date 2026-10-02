// A supplied argument can override the array default, and an escaped function has unknown callers.
// Global injection keeps both families; pure only rewrites the default receiver.
function f({
  at
} = [[1, 2]][0]) {
  return at;
}
use(f("ab"));
function g({
  includes
} = [1, 2]) {
  return includes;
}
use(g);

import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// A supplied argument can override the array default, and an escaped function has unknown callers.
// The closed String caller narrows; the escaped function dispatches on its actual incoming receiver.
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
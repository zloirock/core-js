import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.concat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// An exported function, an escaped function and a callback have unknown callers.
// Global injects each instance method; pure dispatches on each actual incoming receiver.
export function exposed({
  at
}) {
  return at;
}
function escaping({
  includes
}) {
  return includes;
}
hand(escaping);
subscribe(({
  concat
}) => concat);
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.string.at";
import "core-js/modules/web.dom-collections.entries";
// A selected Object constructor uses its static; a custom receiver retains its own method.
export function read(choice, custom) {
  return (choice ? Object : custom)?.entries({
    x: 3
  }).at(0);
}
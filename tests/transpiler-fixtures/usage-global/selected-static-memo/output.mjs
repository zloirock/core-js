import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// Capturing a selected constructor retains candidates without proving either branch.
export function read(choice) {
  return (choice ? Array : null)?.from([3]).at(0);
}
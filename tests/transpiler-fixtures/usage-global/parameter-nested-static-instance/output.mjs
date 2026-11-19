import "core-js/modules/es.array.of";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
// A nested instance read keeps the outer static before the default parameter is mirrored.
function read({
  Array: {
    of: {
      name
    }
  }
} = globalThis) {
  return name;
}
read();
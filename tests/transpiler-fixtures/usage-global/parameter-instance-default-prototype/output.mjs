import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// A parameter default mirrors the known constructor's prototype methods.
// A supplied object still reads its own properties and runs its own leaf default.
export function read({
  prototype: {
    at = Array.from,
    flat
  }
} = Array) {
  return [at, flat];
}
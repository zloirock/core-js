import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
// The catch pattern reads a static from the thrown constructor.
try {
  throw Promise;
} catch ({
  resolve
}) {
  use(resolve);
}
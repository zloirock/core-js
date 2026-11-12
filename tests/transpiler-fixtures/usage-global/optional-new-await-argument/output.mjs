import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// The optional call returns the constructor; await inside it remains lowerable.
export async function read(arr) {
  return new (arr.at?.(await 0))(7);
}
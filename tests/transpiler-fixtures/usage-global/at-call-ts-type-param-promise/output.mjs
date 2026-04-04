import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.string.at";
function unwrap<T>(p: Promise<T>): T {
  return null as any;
}
const p: Promise<string> = Promise.resolve('x');
unwrap(p).at(0).normalize();
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.string.at";
// A build-decided initializer contributes only its live value to later local reads.
export function read(flag) {
  let value = typeof Promise !== "undefined" ? "ab" : ["x"];
  if (flag) value = "cd";
  return value.at(0);
}
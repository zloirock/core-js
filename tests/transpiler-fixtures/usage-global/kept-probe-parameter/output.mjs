import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A parameter default keeps its store without repeatedly refreshing its children.
// A supplied argument still owns the parameter values.
let held;
export function read({
  resolve
} = (held = globalThis.window)?.self.Promise) {
  return [resolve, held];
}
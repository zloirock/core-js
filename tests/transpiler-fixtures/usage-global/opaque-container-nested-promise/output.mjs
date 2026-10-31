import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.with-resolvers";
// Selection through a nested container still owes only the named Promise static in global.
const source = {
  values: [Promise]
};
export function read(key) {
  return source.values[key].withResolvers();
}
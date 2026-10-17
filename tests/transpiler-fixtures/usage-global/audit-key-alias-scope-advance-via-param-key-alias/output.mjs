import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// NEGATIVE: an alias of the PARAM is an arbitrary caller value - the computed dispatch
// keeps its own guard
const j = 'from';
export function viaParamKeyAlias(j) {
  const p = j;
  return Array[p]?.([2]);
}
import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
// A local constructor namesake keeps the supplied object and its properties.
export function read(Promise) {
  const {
    all,
    ...rest
  } = Promise;
  return [all, rest];
}
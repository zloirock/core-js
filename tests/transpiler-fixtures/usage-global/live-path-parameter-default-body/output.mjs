import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Extracted defaults keep the earlier statement and the later array binding.
export const log = [];
export const value = function read({
  from,
  ...rest
} = Array, list = [1]) {
  log.push(1);
  const [, {
    includes
  }] = [0, list];
  return [typeof from, typeof includes, typeof rest];
}();
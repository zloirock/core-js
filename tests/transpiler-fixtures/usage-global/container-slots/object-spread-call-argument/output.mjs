import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A container passed through a spread argument can be written by the callee before its slot read.
function consume(first) {
  if (first) first.k = Map;
}
const escapedBySpread = function () {
  const spreadBox = {
    k: Object
  };
  consume(...[spreadBox]);
  const {
    k: {
      groupBy
    }
  } = spreadBox;
  return groupBy;
}();
export { escapedBySpread };
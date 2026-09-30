import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.values";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.values";
// An index read through a spread keeps the selected runtime element as its receiver.
const spreadSrc = [[9]];
const overSpread = function () {
  const {
    0: {
      values
    }
  } = [...spreadSrc];
  return values;
}();
export { overSpread };
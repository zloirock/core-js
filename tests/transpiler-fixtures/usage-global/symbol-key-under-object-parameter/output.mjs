import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
export const method = (({
  w: {
    [Symbol.iterator]: it
  }
}) => it)({
  w: [1]
});
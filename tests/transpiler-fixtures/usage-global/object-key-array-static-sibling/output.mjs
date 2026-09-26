import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.math.sign";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The object key and native array iteration select a static receiver once.
// The static getter remains ahead of its binding and the neighbouring element binding.
const held = {
  k: [Math]
};
export const {
  k: [{
    sign
  }, tail]
} = held;
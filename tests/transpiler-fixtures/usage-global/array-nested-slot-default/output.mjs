import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Array evaluation finishes before the nested object read.
const receiver = {
  get y() {
    record("get");
    return [1, [2]];
  }
};
const [{
  y: {
    flat
  } = []
}] = [receiver, record("rhs")];
export { flat };
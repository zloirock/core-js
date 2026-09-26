import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Array evaluation finishes before the nested object read.
const receiver = {
  get y() {
    record("get");
    return [1, 2];
  }
};
const [{
  y: {
    at
  } = []
}] = [receiver, record("rhs")];
export { at };
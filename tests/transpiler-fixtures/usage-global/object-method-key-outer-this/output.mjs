import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A computed method key evaluates with the enclosing this, including under arrows.
// The method body keeps its own receiver.
const o = {
  [this.Symbol.iterator]() {
    return this;
  }
};
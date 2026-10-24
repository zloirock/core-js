import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The nested slot reads a method function, not the value its body would return.
// Functions have no built-in keys method, so this pattern adds no instance polyfill.
for (const {
  w: {
    keys
  }
} of [{
  w() {
    return Object;
  }
}, {
  w() {
    return Object;
  }
}]) keys;
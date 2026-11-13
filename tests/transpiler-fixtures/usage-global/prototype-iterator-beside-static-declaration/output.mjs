import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A prototype iterator and its static sibling share the same native pattern reads.
const {
  Array: {
    from,
    prototype: {
      [Symbol.iterator]: iterator
    }
  }
} = globalThis;
export { from, iterator };
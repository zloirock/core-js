import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A numeric intermediate slot is read once before its iterator property.
let item, iterator;
({
  0: {
    item,
    [Symbol.iterator]: iterator
  }
} = globalThis.Array);
export { item, iterator };
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Each pattern reads the intermediate slot once, including quoted and numeric property names.
let item, iterator;
({
  'a-b': {
    item,
    [Symbol.iterator]: iterator
  }
} = globalThis.Array);
({
  0: {
    item,
    [Symbol.iterator]: iterator
  }
} = globalThis.Array);
export { item, iterator };
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A prototype iterator beside a static is served without losing its assignment target.
let from, iterator;
({
  Array: {
    from,
    prototype: {
      [Symbol.iterator]: iterator
    }
  }
} = globalThis);
export { from, iterator };
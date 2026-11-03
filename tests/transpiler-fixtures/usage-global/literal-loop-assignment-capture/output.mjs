import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Relocating a loop head preserves a native static beside an instance claim.
let from, at;
for ({
  C: {
    from
  },
  values: {
    at
  }
} of [{
  C: Array,
  values: [1]
}]) {
  use(from, at);
}
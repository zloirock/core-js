import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Heterogeneous literal elements need a guard around the nested static extraction.
// A custom property is retained and a null receiver still throws on its own iteration.
for (let {
  w: {
    from
  }
} of [{
  w: Array
}, {
  w: {
    from: custom
  }
}, {
  w: null
}]) {
  use(from([7]), () => from([8]));
}
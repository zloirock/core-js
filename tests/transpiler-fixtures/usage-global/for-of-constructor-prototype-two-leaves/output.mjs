import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Both leaves of a nested prototype head use the same array receiver type.
// Moving the head into the body retains the whole element separately from each leaf.
for (const {
  w: {
    prototype: {
      at,
      includes
    }
  }
} of [{
  w: Array
}]) use(at, includes);
import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.species";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A receiver default below rest still owns its nested static; supplied elements stay native.
function read(...[{
  Array: {
    from
  }
} = globalThis]) {
  return from;
}
const [first, ...[{
  Object: {
    hasOwn
  }
} = globalThis]] = values;
import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// usage-global counterpart of the pure fold: `iterator` off the bare Symbol constructor IS
// Symbol.iterator, so `[...][iterator]` is recognised as an iterator-method access. global mutates
// the prototype rather than substituting a helper, so it injects the iterator + symbol side-effect
// modules (no `_getIteratorMethod` fold); both emitters resolve the alias identically
const {
  iterator
} = Symbol;
[1, 2][iterator];
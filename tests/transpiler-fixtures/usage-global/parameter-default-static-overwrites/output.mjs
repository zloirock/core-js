import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Effectful keys keep the native pattern; both statics are served in the body.
function read([{
  of,
  from,
  [(effect(), "key")]: other
} = Array]) {
  return [of(4), from([9]), other];
}
read([void 0]);
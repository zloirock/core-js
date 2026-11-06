import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.apply";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A replaced invoker observes the original arguments. A known function parameter does not
// authorize synthesizing the values passed to the user replacement of Reflect.apply.
function read([{
  from
} = Array]) {
  return from;
}
Reflect.apply = (fn, receiver, args) => args[0][0] === Array;
Reflect.apply(read, null, [[Array]]);
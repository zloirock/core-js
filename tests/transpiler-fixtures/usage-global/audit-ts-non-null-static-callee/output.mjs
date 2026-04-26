import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// TS `!` non-null on a static callee `Map!.groupBy(...)`: the wrapper is peeled and
// the static call is rewritten to the polyfill.
Array.from!([1]);
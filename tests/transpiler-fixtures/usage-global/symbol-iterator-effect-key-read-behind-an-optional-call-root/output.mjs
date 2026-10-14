import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A computed Symbol.iterator key with an effect, read without a call behind a `?.` over a call result, is
// detected like its effect-free twin: the lookup pulls the iterator modules.
// One form per fixture: every receiver form loads this same module set, so a second row would mask the first.
let n = 0;
get()?.rows[n++, Symbol.iterator];
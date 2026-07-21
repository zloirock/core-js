import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// bare method extracts and a well-known-symbol read as `new` arguments: import-only
// injection (MIGHT-bias) - the constructor callee and the argument text stay untouched
const t1 = new Tag(arr.at, 'x');
const t2 = new Tag(list[Symbol.iterator], 'y');
const t3 = new Tag(...items.flat, 'z');
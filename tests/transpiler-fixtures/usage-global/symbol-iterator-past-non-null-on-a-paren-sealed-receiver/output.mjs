import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A `!` on a receiver a paren seals hides nothing from usage detection of a Symbol.iterator lookup called off
// it: the lookup pulls the iterator modules as it would without the assertion.
// One form per fixture: every receiver form loads this same module set, so a second row would mask the first.
declare const strs: string[] | null;
(strs?.[2])![Symbol.iterator]().next();
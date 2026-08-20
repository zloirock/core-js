import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `(Symbol?.iterator) in obj` parenthesised optional access: the `in`-check on a
// well-known symbol still routes through the iterability polyfill dispatch.
const obj = {};
Symbol?.iterator in obj;
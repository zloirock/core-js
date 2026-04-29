import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// optional computed access `obj?.[Symbol.iterator]`: the well-known symbol must still
// be recognised as an iteration probe even through optional chaining.
arr?.[Symbol.iterator]();
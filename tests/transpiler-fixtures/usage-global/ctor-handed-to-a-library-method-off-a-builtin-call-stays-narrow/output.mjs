import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.error.cause";
import "core-js/modules/es.error.is-error";
import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.regexp.constructor";
import "core-js/modules/es.regexp.dot-all";
import "core-js/modules/es.regexp.exec";
import "core-js/modules/es.regexp.sticky";
import "core-js/modules/es.string.iterator";
// a constructor handed to a standard-library method off what a builtin call returns - typed by that
// call's known return type - is called by the library alone, which reads no static off it: no escape,
// so a polyfilled constructor keeps its narrow entry and one core-js does not polyfill loads nothing.
// the same method off a receiver nothing types is no known library, and its argument still escapes
export const symbols = Array.from(names).map(Symbol);
export const numbers = String(text).split(',').filter(Number);
export const patterns = Object.values(table).flatMap(RegExp);
export const labelled = Array.of(1, 2).every(String);
export const errors = messages.find(Error);
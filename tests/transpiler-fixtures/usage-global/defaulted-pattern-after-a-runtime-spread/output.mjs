import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An unknown runtime spread can supply the pattern; it does not prove omission.
// Keep the Array default in its own arm and serve the actual instance generically.
Array.prototype[Symbol.iterator] = function* () {
  yield 'text';
};
export const result = (({
  at
} = [1]) => at.call('ok', 0))(...[]);
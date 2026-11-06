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
// An identity return takes its value from the runtime argument position.
// A changed iterator prevents peeling the spread's literal element as that value.
Array.prototype[Symbol.iterator] = function* () {
  yield 'text';
};
export const result = (value => value)(...[[1]]).at(0);
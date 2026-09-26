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
// The later initializer may replace the variable holding the first element.
// Property reads still use the value captured before that replacement.
export function read(receiver, replace) {
  const [{
    other,
    at
  }, tail] = [receiver, receiver = replace()];
  return [other, at, tail];
}
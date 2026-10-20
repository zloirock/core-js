import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A symbol method with arguments keeps the first receiver and its own this value.
// The nested argument claim is visited after rendering the outer invocation.
export function read(get) {
  return get()[Symbol.iterator]([7].at(0));
}
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
// A getter observes preceding array bindings and the uninitialized following binding.
// Neighbouring declarators retain their source evaluation order.
export function read(make) {
  const lead = 1,
    [before, {
      at
    }, after] = [2, make(() => [before, after]), 3],
    tail = 4;
  return [lead, before, at, after, tail];
}
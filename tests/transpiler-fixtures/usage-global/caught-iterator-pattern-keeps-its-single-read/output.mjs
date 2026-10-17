import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A relocated catch pattern resolves its iterator key in its own scope even when
// the moved pattern has no source offsets. Its nested default precedes the tail,
// and extracting the iterator leaves no second native read as an unused binding.
export function read(input, events) {
  try {
    throw input;
  } catch ({
    [Symbol.iterator]: {
      missing = (events.push('default'), 7)
    },
    tail
  }) {
    return [missing, tail];
  }
}
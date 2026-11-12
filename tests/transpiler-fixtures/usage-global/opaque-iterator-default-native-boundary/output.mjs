import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An opaque iterator keeps inner-default reads inside its step, before IteratorClose.
// Global mode keeps the pattern and injects the named static.
// The local iterable yields undefined, selecting the receiver default.
const events = [];
const iterable = {
  [Symbol.iterator]() {
    return {
      next() {
        return {
          done: false,
          value: undefined
        };
      },
      return() {
        events.push('close');
        return {};
      }
    };
  }
};
const [{
  Array: {
    of
  },
  [(events.push('key'), 'missing')]: value
} = globalThis] = iterable;
use(of, value, events);
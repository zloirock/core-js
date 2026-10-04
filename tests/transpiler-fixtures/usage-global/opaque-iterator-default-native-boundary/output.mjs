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
// Its pattern stays native in pure mode; global mode still injects the named static.
// This also covers a body declaration whose outer array receiver is an unknown parameter.
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
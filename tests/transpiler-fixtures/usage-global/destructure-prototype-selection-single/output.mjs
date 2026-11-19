import "core-js/modules/es.array.at";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.includes";
// A decided realm selection preserves its effect prefix before the prototype read.
// A single nested instance slot receives the same polyfill as a pair of slots.
const events = [];
class Source {
  static get effect() {
    events.push('effect');
    return 0;
  }
}
const {
  Array: {
    prototype: {
      at
    }
  }
} = (Source.effect, globalThis) ?? {};
const {
  String: {
    prototype: {
      includes
    }
  }
} = (events.push("call"), globalThis) || {};
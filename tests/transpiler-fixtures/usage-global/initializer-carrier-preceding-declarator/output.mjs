import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
// The initializer prefix stays after an earlier declarator
// and before the following declarator.
const lead = effect("lead"),
  {
    Array: {
      prototype: {
        at: method
      }
    }
  } = (effect("init"), globalThis),
  tail = effect("tail");
use(lead, method, tail);
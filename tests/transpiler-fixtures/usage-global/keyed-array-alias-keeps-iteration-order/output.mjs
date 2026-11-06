import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An array alias can gain indexed getters or its own iterator before the pattern reads it.
// Keep its native iteration so a later read observes the preceding instance binding.
const events = [];
const row = [[], 0];
Object.defineProperty(row, 1, {
  get() {
    events.push(typeof method);
    return 9;
  }
});
const {
  w: [{
    at: method
  }, tail]
} = {
  w: row
};
use(method, tail, events);
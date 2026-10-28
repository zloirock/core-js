import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
// Consuming the inner pattern keeps its setter before the outer binding.
// Its returned receiver is no longer read after both patterns have been consumed.
const events = [];
const target = {
  set read(value) {
    events.push(value([2])[0]);
  }
};
let read;
({
  from: read
} = {
  from: target.read
} = (events.push('init'), Array));
export const result = [read([5]), events];
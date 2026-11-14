import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Captured literal navigation stays a native slot read before the instance dispatch.
let from, at;
({
  C: {
    from
  },
  entries: {
    at
  }
} = {
  C: Array,
  entries: [1]
});
use(from, at);
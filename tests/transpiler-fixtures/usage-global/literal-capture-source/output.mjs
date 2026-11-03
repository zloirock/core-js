import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A residual over a generated capture keeps its original literal source.
let from, at;
({
  C: {
    from
  },
  values: {
    at
  }
} = {
  C: Array,
  values: [1]
});
use(from, at);
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A top-level this residual runs after the initializer sequence prefix.
// The static from extraction follows that native read, including its throw in a module.
let k = 0,
  from,
  x;
({
  x,
  Array: {
    from
  }
} = (k++, this));
use(from, x, k);
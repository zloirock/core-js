import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// the static-receiver walk descends an arbitrarily deep nested destructure binding (three
// levels here) to recover the source key path of the aliased constructor
const {
  outer: {
    mid: {
      Array: Arr
    }
  }
} = {
  outer: {
    mid: globalThis
  }
};
const {
  a: {
    from
  }
} = {
  a: Arr
};
from([1, 2, 3]);
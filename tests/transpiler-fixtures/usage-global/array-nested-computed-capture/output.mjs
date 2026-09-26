import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.values";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Nested computed keys retain their native reads after the array initializer.
// The selected Array and String receivers keep their specific instance polyfills.
const [{
  [(mark(), 'items')]: {
    at
  }
}] = [{
  items: [2, 7]
}];
let includes;
[{
  [(mark(), 'text')]: {
    includes
  }
}] = [{
  text: 'abc'
}];
export const [{
  [(mark(), 'items')]: {
    values
  }
}] = [{
  items: [2, 7]
}];
use(at, includes);
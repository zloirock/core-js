import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.starts-with";
import "core-js/modules/web.dom-collections.iterator";
// A proven computed key stays native before the selected array is destructured.
// Its effect runs once after the initializer; exports expose only the source binding.
const key = 'items';
const {
  [key]: [{
    at
  }]
} = {
  items: [[2, 7]]
};
export const {
  [(mark(), 'items')]: [{
    includes
  }]
} = {
  items: ['abc']
};
use(at);
let startsWith;
({
  [(mark(), 'items')]: [{
    startsWith
  }]
} = {
  items: ['abc']
});
use(startsWith);
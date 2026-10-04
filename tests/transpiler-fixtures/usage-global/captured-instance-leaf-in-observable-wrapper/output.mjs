import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.to-spliced";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A sole instance leaf dispatches on its captured literal while its surrounding wrapper
// keeps spread evaluation, native iteration and outer computed keys. The consumed leaf
// must not perform another native method read beside the dispatch.
const {
  0: {
    toSpliced: fromSpread
  }
} = [...[[1]]];
const {
  w: {
    at: fromObjectSpread
  }
} = {
  ...spread,
  w: [1, 2]
};
const {
  [(mark(), 'w')]: {
    includes: afterOuterKey
  }
} = {
  ...spread,
  w: [1, 2]
};
if (ok) var {
  w: {
    findLast: inConditionalBody
  }
} = {
  ...spread,
  w: [1, 2]
};
export { fromSpread, fromObjectSpread, afterOuterKey, inConditionalBody };
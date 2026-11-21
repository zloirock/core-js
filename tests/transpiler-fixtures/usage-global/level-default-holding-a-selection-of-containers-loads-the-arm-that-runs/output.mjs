import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Decided defaults load the statics of the selected constructor at each pattern level.
const {
  W: {
    C: {
      groupBy: viaDecided
    }
  } = typeof Symbol != 'undefined' ? {
    C: Map
  } : {
    C: Object
  }
} = {};
const {
  U: {
    C: {
      allSettled: viaFreshLeft
    }
  } = {
    C: Promise
  } || {
    C: Object
  }
} = {};
const {
  T: [{
    hasOwn: viaArrayLevel
  }] = typeof Symbol != 'undefined' ? [Object] : [Reflect]
} = {};
const [{
  C: {
    of: viaElement
  }
} = typeof Symbol != 'undefined' ? {
  C: Array
} : {
  C: Object
}] = [];
export { viaDecided, viaFreshLeft, viaArrayLevel, viaElement };
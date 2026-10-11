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
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A level default holding a selection of containers reads the slot of the arm that runs where it fires:
// usage-global loads the statics of the live arm of a selection the build decides, and of every arm of an
// undecided one - under an object level, an array level and an element default alike.
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
  V: {
    C: {
      from: viaUndecided
    }
  } = c ? {
    C: Array
  } : {
    C: Iterator
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
export { viaDecided, viaUndecided, viaFreshLeft, viaArrayLevel, viaElement };
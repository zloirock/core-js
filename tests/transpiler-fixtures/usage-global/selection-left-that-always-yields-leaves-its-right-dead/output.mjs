import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.get-prototype-of";
import "core-js/modules/es.array.iterator";
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
// a `||` whose left always yields - a call returning a container, a const alias of one, a store of such
// a call - leaves its right dead: the slot reads the left's container alone
function make() {
  return {
    C: Reflect
  };
}
export const {
  C: {
    getPrototypeOf
  }
} = make() || {
  C: Object
};
const box = {
  D: Iterator
};
export const {
  D: {
    from
  }
} = box || {
  D: Array
};
let stash;
function build() {
  return {
    E: Map
  };
}
export const {
  E: {
    groupBy
  }
} = (stash = build()) || {
  E: Object
};
export { stash };
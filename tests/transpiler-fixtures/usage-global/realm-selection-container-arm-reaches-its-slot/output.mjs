import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a realm selection beside a container arm reads either: the realm's constructor and the container's
// slot each inject their static, in either arm order and under `||`. a container the realm left
// always decides never runs
export const {
  Map: {
    groupBy
  }
} = c ? globalThis : {
  Map: Object
};
export const {
  Math: {
    isInteger
  }
} = c ? {
  Math: Number
} : globalThis;
export const {
  Array: {
    fromEntries
  }
} = d && globalThis || {
  Array: Object
};
export const {
  Reflect: {
    entries
  }
} = globalThis || {
  Reflect: Object
};
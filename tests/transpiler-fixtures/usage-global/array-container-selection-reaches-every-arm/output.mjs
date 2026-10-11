import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a pattern reading through an array container that an open selection chooses reads either arm's
// element: each arm's static is injected, at any wrapper index and under an object key, as the
// object-container twin does. an arm the build never takes adds nothing
export const [{
  groupBy
}] = c ? [Map] : [Object];
export const [, {
  isInteger
}] = c ? [0, Math] : [0, Number];
export const {
  C: [{
    fromEntries
  }]
} = c ? {
  C: [Object]
} : {
  C: [Math]
};
export const [{
  C: {
    allSettled
  }
}] = c ? [{
  C: Array
}] : [{
  C: Promise
}];
export const [{
  any
}] = typeof Symbol != 'undefined' ? [Array] : [Promise];
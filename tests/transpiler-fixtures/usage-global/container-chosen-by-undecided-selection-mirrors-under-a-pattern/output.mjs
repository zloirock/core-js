import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.reject";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.promise.race";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
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
import "core-js/modules/esnext.promise.all-keyed";
import "core-js/modules/esnext.promise.all-settled-keyed";
import "core-js/modules/web.dom-collections.iterator";
// a nested pattern over an undecided selection of containers reads the slot of whichever arm ran, so
// every arm's slot takes the static of the constructor it holds - declared, assigned or passed to a
// parameter - and an arm whose constructor has no such static keeps its own. a hop key read twice leaves
// the read native, and an arm that is no container is the raw branch of the guard over the arm that is
const {
  C: {
    groupBy
  }
} = flag ? {
  C: Object
} : {
  C: Map
};
export const declared = () => groupBy([1], x => x);
let from;
({
  C: {
    from
  }
} = flag ? {
  C: Array
} : {
  C: Iterator
});
export const assigned = () => from([1]);
function read({
  C: {
    of
  }
}) {
  return of;
}
export const passed = () => read(flag ? {
  C: (log(), Array)
} : {
  C: Array
});
const {
  C: {
    try: attempt
  }
} = flag ? {
  C: Promise
} : {
  C: Object
};
export const ownless = () => attempt(() => 1);
const {
  C: {
    withResolvers
  },
  C: held
} = flag ? {
  C: Promise
} : {
  C: Object
};
export const readTwice = () => [withResolvers(), held];
const {
  C: {
    fromEntries
  }
} = flag ? {
  C: Object
} : user;
export const notContainer = () => fromEntries([]);
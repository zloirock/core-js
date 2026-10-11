import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.symbol.key-for";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.concat";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
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
// a selection a container literal holds in a slot reaches every arm in the union the pattern level under
// that slot reads, and an arm that is a for-of head over a literal every element, as the same selection
// spelled as the source does - in every pattern host; each head may hold null, so its selection stays open.
// the loops bring the iteration modules and each element its family
for (const M of [Map, Array, null]) {
  const {
    W: {
      groupBy
    }
  } = {
    W: M || Object
  };
  use(groupBy);
}
for (const P of [Promise, Array, null]) {
  let attempt;
  ({
    W: {
      try: attempt
    }
  } = {
    W: P || Array
  });
  use(attempt);
}
for (const I of [Iterator, Array, null]) {
  (function ({
    W: {
      concat
    }
  } = {
    W: I || Array
  }) {
    use(concat);
  })();
}
for (const S of [Symbol, Array, null]) {
  for (const {
    W: {
      keyFor
    }
  } of [{
    W: S || Array
  }]) use(keyFor);
}
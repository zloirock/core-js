import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.apply";
import "core-js/modules/es.reflect.construct";
import "core-js/modules/es.reflect.define-property";
import "core-js/modules/es.reflect.delete-property";
import "core-js/modules/es.reflect.get";
import "core-js/modules/es.reflect.get-own-property-descriptor";
import "core-js/modules/es.reflect.get-prototype-of";
import "core-js/modules/es.reflect.has";
import "core-js/modules/es.reflect.is-extensible";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.reflect.prevent-extensions";
import "core-js/modules/es.reflect.set";
import "core-js/modules/es.reflect.set-prototype-of";
import "core-js/modules/es.reflect.to-string-tag";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
import "core-js/modules/web.dom-collections.iterator";
// a `||` whose test the build decides false runs its right, and a pattern reading through it loads the
// statics of that right spelled alone, as through the `&&` twin whose test holds: declared, assigned, as a
// parameter default, in a for-of head, beside a rest or an effectful key, for an instance method - a
// parameter's own default among them - and where the test is an `&&` whose own test fails - whose right loads
// nothing
export const {
  C: {
    groupBy
  }
} = typeof Symbol == 'undefined' || {
  C: Map
};
let fromAsync;
({
  C: {
    fromAsync
  }
} = typeof Symbol == 'undefined' || {
  C: Array
});
export function viaParam({
  C: {
    withResolvers
  }
} = typeof Symbol == 'undefined' || {
  C: Promise
}) {
  return withResolvers;
}
for (const {
  C: {
    fromEntries
  }
} of [typeof Symbol == 'undefined' || {
  C: Object
}]) console.log(fromEntries);
export const {
  C: {
    ownKeys
  },
  ...rest
} = typeof Symbol == 'undefined' || {
  C: Reflect,
  D: 1
};
export const {
  [(console.log(), 'C')]: {
    raw
  }
} = typeof Symbol == 'undefined' || {
  C: String
};
export const {
  C: {
    at
  }
} = typeof Symbol == 'undefined' || {
  C: [1, 2]
};
export function instanceViaParam({
  at: last
} = typeof Symbol == 'undefined' || [1, 2]) {
  return last;
}
export const {
  C: {
    hasOwn
  }
} = typeof Symbol == 'undefined' && {
  C: Set
} || {
  C: Object
};
export { fromAsync };
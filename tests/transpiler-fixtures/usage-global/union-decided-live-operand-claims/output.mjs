import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A pattern whose outer value no literal spells - a catch parameter, a for-in head - reads its inner default
// through the usage-global union alone, and a selection the build decides hands that union its live operand:
// the left's static keeps its module (`Array.from`, `Map.groupBy`, `Promise.try`, `Object.fromEntries`), the
// dead right's does not (no `Iterator.from`, no `Object.groupBy`).
try {
  throw {};
} catch ({
  inner: {
    from
  } = Array || Iterator
}) {
  use(from);
}
try {
  throw {};
} catch ({
  a: {
    b: {
      groupBy
    } = Map || Object
  } = {}
}) {
  use(groupBy);
}
try {
  throw {};
} catch ({
  p: {
    try: attempt
  } = globalThis.Promise ?? Set
}) {
  use(attempt);
}
for (const {
  inner: {
    fromEntries
  } = Object || Map
} in {
  k: 1
}) use(fromEntries);
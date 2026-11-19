import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.function.name";
import "core-js/modules/es.string.iterator";
// An assignment pattern reading a static's `name` beside an unknown computed key off the constructor: the
// `name` claim loads its module beside the static's.
let name, zk;
({
  from: {
    name
  } = {},
  [k]: zk
} = Array);
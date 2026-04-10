import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
const {
  from
} = Array as any;
const {
  resolve
} = Promise satisfies typeof Promise;
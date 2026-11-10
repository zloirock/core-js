import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.reject";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.push";
// A replaced constructor needs no native static Get; computed-key effects still run.
let r;
const effects = [];
const a = Promise.resolve,
  b = Promise[effects.push('key'), 'reject'];
r = [typeof a, typeof b];
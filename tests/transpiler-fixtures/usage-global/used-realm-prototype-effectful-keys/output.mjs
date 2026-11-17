import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// Each effectful key runs on its own hop before the assignment yields its receiver.
const proxyKey = 'self',
  ctorKey = 'Promise';
let usedPrototype;
let hits = 0;
const keptEffects = {
  [(++hits, proxyKey)]: {
    [(++hits, ctorKey)]: {
      prototype: usedPrototype
    }
  }
} = globalThis;
use(keptEffects, usedPrototype, hits);
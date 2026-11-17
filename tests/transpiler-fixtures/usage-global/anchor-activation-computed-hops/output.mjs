import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// Computed realm and constructor keys retain the selected prototype.
const proxyKey = 'self',
  ctorKey = 'Promise';
const {
  [proxyKey]: {
    [ctorKey]: {
      prototype
    }
  }
} = globalThis;
use(prototype);
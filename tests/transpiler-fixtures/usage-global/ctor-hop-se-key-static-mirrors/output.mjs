import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.race";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The pure flavor's mirror has no counterpart here - this flavor rewrites nothing - so what the
// twin's shapes owe in GLOBAL mode is their families, one method per row so none can hide another's.
let n = 0;
const {
  Promise: {
    [(n++, 'race')]: sole
  }
} = globalThis;
const {
  Promise: {
    [(n++, 'all')]: sibling,
    allSettled
  }
} = globalThis;
export const result = [typeof sole, typeof sibling, typeof allSettled, n];
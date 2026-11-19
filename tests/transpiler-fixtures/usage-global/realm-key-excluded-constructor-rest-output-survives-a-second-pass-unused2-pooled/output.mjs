import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
const {
  Promise: {
    any: _unused2,
    prototype: {
      catch: rescue
    },
    ...pooled
  } = _Set
} = _self;
export { rescue };
export { pooled };
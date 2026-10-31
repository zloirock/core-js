import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// several computed keys over a selection the build decides read the operand that runs as a plain
// receiver: its effect leads the first key, and no coercion keeps the constructor - nor the namespace
// entry an escape of a decided selection imports
// usage-global rewrites nothing: the `typeof Symbol` test loads the symbol, the Promise read its constructor
// modules, `any` its own with the error, resolve and iteration it takes, `withResolvers` and `log.push` theirs
export const log = [];
export const {
  [(log.push('k1'), 'any')]: any,
  [(log.push('k2'), 'withResolvers')]: withResolvers
} = typeof Symbol != 'undefined' ? (log.push('init'), Promise) : Object;
import "<CWD>/packages/core-js/modules/es.object.to-string.js";
import "<CWD>/packages/core-js/modules/es.reflect.own-keys.js";
import "<CWD>/packages/core-js/modules/es.aggregate-error.constructor.js";
import "<CWD>/packages/core-js/modules/es.promise.constructor.js";
import "<CWD>/packages/core-js/modules/es.promise.catch.js";
import "<CWD>/packages/core-js/modules/es.promise.finally.js";
import "<CWD>/packages/core-js/modules/es.promise.reject.js";
import "<CWD>/packages/core-js/modules/es.promise.resolve.js";
import "<CWD>/packages/core-js/modules/es.promise.all.js";
import "<CWD>/packages/core-js/modules/es.promise.all-settled.js";
import "<CWD>/packages/core-js/modules/es.promise.any.js";
import "<CWD>/packages/core-js/modules/es.promise.race.js";
import "<CWD>/packages/core-js/modules/es.promise.try.js";
import "<CWD>/packages/core-js/modules/es.promise.with-resolvers.js";
import "<CWD>/packages/core-js/modules/es.array.iterator.js";
import "<CWD>/packages/core-js/modules/es.global-this.js";
import "<CWD>/packages/core-js/modules/es.number.constructor.js";
import "<CWD>/packages/core-js/modules/es.number.is-integer.js";
import "<CWD>/packages/core-js/modules/es.string.iterator.js";
import "<CWD>/packages/core-js/modules/esnext.promise.all-keyed.js";
import "<CWD>/packages/core-js/modules/esnext.promise.all-settled-keyed.js";
import "<CWD>/packages/core-js/modules/web.dom-collections.iterator.js";
const {
    Number: {
      isInteger
    }
  } = globalThis,
  nested = () => {
    const NAME = 'Promise';
    return (globalThis as any)[NAME];
  };
export { isInteger, nested };
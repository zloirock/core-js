import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
// The namespace publishes the source bindings while its computed key retains its original position.
const effects = [];
function mark() {
  effects.push('key');
}
namespace Surface {
  export const {
    globalThis: {
      [(mark(), 'Promise')]: {
        resolve
      }
    },
    Infinity: infinity
  } = globalThis;
}
export { Surface, effects };
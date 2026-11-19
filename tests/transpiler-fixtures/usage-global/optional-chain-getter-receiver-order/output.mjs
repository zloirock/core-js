import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// An optional method lookup can invoke a getter that replaces its receiver binding.
// The following call retains the object captured before that getter, and its result
// continues through the guarded computed member exactly once.
let arr = [['outer']];
const after = [['inner']];
Object.defineProperty(arr, 'at', {
  get() {
    arr = after;
    return function () {
      return this[0];
    };
  }
});
let hits = 0;
export const result = [arr?.at?.(0)?.[hits++, 'includes']('outer'), hits];
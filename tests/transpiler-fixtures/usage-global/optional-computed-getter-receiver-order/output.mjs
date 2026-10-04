import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// Quiet computed method keys preserve the source receiver's exact hint set.
// Both optional-call forms capture that receiver before a getter replaces its binding;
// the quoted key introduces no effect to rescue when the instance lookup is emitted.
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
export const doubleOptional = arr?.['at']?.(0)?.includes('outer');
let other = [['first']];
const later = [['second']];
Object.defineProperty(other, 'at', {
  get() {
    other = later;
    return function () {
      return this[0];
    };
  }
});
export const callOptional = other['at']?.(0)?.indexOf('first');
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
function realm() {
  return globalThis;
}
function opaque() {
  return {
    Array: {
      of() {
        return 'custom';
      }
    }
  };
}
export function direct(flag) {
  return (flag ? realm() : opaque()).Array.of(1);
}
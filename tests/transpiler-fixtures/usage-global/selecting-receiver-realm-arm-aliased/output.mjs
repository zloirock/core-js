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
export function aliased(flag) {
  const held = (flag ? realm() : opaque()).Array;
  return held.of(1);
}
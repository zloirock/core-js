import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
// The extracted prototype method and constructed receiver use the same pure constructor.
const {
  WeakMap: {
    prototype: {
      has
    }
  }
} = globalThis;
const key = {};
export const r = has.call(new WeakMap([[key, 1]]), key);
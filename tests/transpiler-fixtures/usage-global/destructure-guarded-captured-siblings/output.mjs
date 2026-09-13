import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
// Capturing a guarded static keeps earlier instance and declarator claims live.
// The user object is not a realm alias: its getters run once in source order.
// The Array getter proves the prototype family, so the instance claim needs no String polyfill.
export function captured(log) {
  const source = {
    get Array() {
      log.push('Array');
      return Array;
    },
    get Object() {
      log.push('Object');
      return Object;
    },
    get other() {
      log.push('other');
      return 7;
    }
  };
  let held;
  const {
      from
    } = Array,
    {
      Array: {
        prototype: {
          at
        }
      },
      Object: {
        keys
      },
      other
    } = held = (log.push('source'), source);
  return [from('ab'), at.call([4, 8], -1), keys({
    a: 1
  }), other, held === source];
}
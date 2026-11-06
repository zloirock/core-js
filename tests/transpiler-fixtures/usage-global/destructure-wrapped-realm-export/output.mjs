import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
// Exported nested extraction through a non-null realm still needs the realm's polyfill.
// Neighboring declarators and the extracted exported bindings keep their source order.
export const before = 1,
  {
    w: {
      Array: {
        prototype: {
          at,
          flat
        }
      }
    }
  } = {
    w: globalThis!
  },
  after = 2;
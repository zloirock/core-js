import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
// Nested instance extraction through a non-null realm still needs the realm's polyfill.
// Both captured methods must work without the native global and prototype methods.
const {
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
};
use(at, flat);
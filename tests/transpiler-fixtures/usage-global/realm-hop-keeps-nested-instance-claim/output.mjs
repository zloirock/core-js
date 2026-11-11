import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
// A realm-only anchor waits for its nested instance claim.
const {
  globalThis: {
    Array: {
      prototype: {
        at
      }
    },
    Object: o
  }
} = globalThis;
export { at, o };
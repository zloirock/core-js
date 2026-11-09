import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.global-this";
// A leading realm hop is peeled before extracting instance methods from an alias.
const realm = globalThis;
const {
  globalThis: {
    Array: {
      prototype: {
        at,
        includes
      }
    }
  }
} = realm;
export { at, includes };
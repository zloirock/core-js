import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// Every leading pristine realm hop folds, including the one carrying a default.
const {
  globalThis: {
    self: {
      Array: {
        prototype: {
          at
        }
      }
    } = globalThis
  }
} = globalThis.globalThis;
use(at);
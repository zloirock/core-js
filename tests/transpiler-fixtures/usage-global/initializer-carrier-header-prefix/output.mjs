import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.global-this";
// A loop initializer keeps one prefix ahead of its extracted reads.
for (let {
    Array: {
      prototype: {
        at: method,
        includes: contains
      }
    }
  } = (effect(), globalThis), once = true; once; once = false) {
  use(method, contains);
}
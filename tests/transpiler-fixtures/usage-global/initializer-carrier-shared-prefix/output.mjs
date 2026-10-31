import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.global-this";
// Two extracted reads share one initializer prefix.
const {
  Array: {
    prototype: {
      at: method,
      includes: contains
    }
  }
} = (effect(), globalThis);
use(method, contains);
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A computed iterator claim keeps its member target and does not read native Symbol.
export const box = {};
({
  globalThis: {
    Array: {
      prototype: {
        [Symbol.iterator]: box.iterator = null
      }
    }
  }
} = globalThis);
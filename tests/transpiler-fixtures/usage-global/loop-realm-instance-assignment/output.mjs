import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A relocated assignment head mirrors the realm hop before dispatching
// its nested prototype leaf, without changing the receiver used by the body.
let at, from;
for ({
  globalThis: {
    Array: {
      prototype: {
        at
      },
      from
    }
  }
} of [globalThis]) use(at, from);
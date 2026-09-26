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
// A fixed first element can be captured before an opaque trailing spread iterates.
// Its nested instance read retains the Array polyfill and the spread's effects.
let visits = 0;
const tail = {
  [Symbol.iterator]() {
    visits++;
    return [1][Symbol.iterator]();
  }
};
const [{
  Array: {
    prototype: {
      at
    }
  }
}] = [globalThis, ...tail];
export { at, visits };
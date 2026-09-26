import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.is";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An exported static binding under an object key still injects Object.is.
// The source retains both array levels and its property read.
const wrapped = [{
  k: [Object]
}];
export const [{
  k: [{
    is
  }]
}] = wrapped;
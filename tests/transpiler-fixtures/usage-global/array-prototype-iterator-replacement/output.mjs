import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.is";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A visible prototype iterator replacement invalidates stored-element proofs.
// Pure keeps the array pattern native; global still injects for the possible static.
Array.prototype[Symbol.iterator] = function* () {
  yield {
    is: () => false
  };
};
const wrapped = [{
  k: [Object]
}];
const [{
  k: [{
    is
  }]
}] = wrapped;
is(1, 1);
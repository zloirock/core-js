import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.starts-with";
import "core-js/modules/web.dom-collections.iterator";
// Both declaration and assignment loop heads serve instance leaves below an array.
// The extracted assignment bindings remain available after the loop exits.
for (const {
  w: [{
    at,
    flat
  }]
} of [{
  w: [[1, [2]]]
}]) use(at, flat);
let includes, startsWith;
for ({
  w: [{
    includes,
    startsWith
  }]
} of [{
  w: ['abc']
}]) break;
use(includes, startsWith);
import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a for-of loop re-executes the IIFE the way a C-style one does: the array write of the previous
// iteration reaches the read inside it, so the string init proves nothing from iteration 2 on and
// both families inject
let P = 'str';
for (const step of [1, 2]) {
  (() => P.at(step))();
  P = [1, 2];
}
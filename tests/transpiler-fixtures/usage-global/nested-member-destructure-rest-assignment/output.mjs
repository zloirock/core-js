import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
// A rest assignment copies fields without exposing the source object.
const wrap = {
  box: {
    data: [1, 2]
  }
};
let copy;
({
  ...copy
} = wrap.box);
export const {
  at
} = wrap.box.data;
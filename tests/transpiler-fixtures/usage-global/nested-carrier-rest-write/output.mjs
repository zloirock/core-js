import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Rest above the object copies its reference, so writes through the copy widen its fields.
const wrap = {
  box: {
    data: [1, 2]
  }
};
const {
  ...copy
} = wrap;
copy.box.data = "abc";
export const {
  at
} = wrap.box.data;
import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
// A rest copy reads field values without exposing the source object or widening its fields.
const wrap = {
  box: {
    data: [1, 2]
  }
};
const {
  ...rest
} = wrap.box;
export const {
  at
} = wrap.box.data;
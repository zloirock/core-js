import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.string.at";
// Replacing a field on the rest copy does not change the source field or its string type.
const wrap = {
  box: {
    data: "abc"
  }
};
const {
  ...copy
} = wrap.box;
copy.data = [1, 2];
export const {
  at
} = wrap.box.data;
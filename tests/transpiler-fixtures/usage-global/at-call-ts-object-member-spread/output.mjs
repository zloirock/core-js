import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
const other = {
  x: 1
};
const obj = {
  ...other,
  items: [1, 2, 3]
};
obj.items.at(-1);
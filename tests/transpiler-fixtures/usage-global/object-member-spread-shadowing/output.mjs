import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.number.to-fixed";
const other = {
  count: 'hello'
};
const obj = {
  count: 42,
  ...other
};
obj.count.toFixed(2);
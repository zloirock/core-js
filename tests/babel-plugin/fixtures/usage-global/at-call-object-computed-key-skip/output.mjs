import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.string.at";
const items = Symbol();
const obj = {
  items: 'hello',
  [items]: ['a', 'b']
};
obj.items.at(0);
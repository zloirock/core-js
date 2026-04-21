import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// onSpreadElement: inside ObjectExpression - no iterator polyfill needed.
// Everywhere else (array, call args) - iterator polyfill needed
const arr = [...x];
const obj = {
  ...y
};
foo(...z);
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A stored repositioning method may change the array whose slot is read later.
const repositionedByStoredMethod = function () {
  const storedBox = [Object, Map];
  const m = storedBox.reverse;
  m.call(storedBox);
  const {
    0: {
      groupBy
    }
  } = storedBox;
  return groupBy;
}();
export { repositionedByStoredMethod };
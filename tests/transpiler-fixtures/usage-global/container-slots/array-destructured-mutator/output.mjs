import "core-js/modules/es.object.get-own-property-descriptor";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Destructuring a repositioning method preserves its possible write to the array receiver.
const repositionedByDestructuredMethod = function () {
  const patternBox = [Object, Map];
  const {
    reverse
  } = patternBox;
  reverse.call(patternBox);
  const {
    0: {
      getOwnPropertyDescriptor
    }
  } = patternBox;
  return getOwnPropertyDescriptor;
}();
export { repositionedByDestructuredMethod };
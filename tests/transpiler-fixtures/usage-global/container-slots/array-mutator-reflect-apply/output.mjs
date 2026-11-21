import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.apply";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Reflect.apply passes the array receiver to a detached repositioning method.
const repositionedByReflectApply = function () {
  const reflected = [Object, Map];
  Reflect.apply(reflected.reverse, reflected, []);
  const {
    0: {
      groupBy
    }
  } = reflected;
  return groupBy;
}();
export { repositionedByReflectApply };
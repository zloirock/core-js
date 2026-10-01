import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.reflect.apply";
// Reflect.apply passes the array receiver to a detached repositioning method.
const repositionedByReflectApply = function () {
  const reflected = [Object];
  Reflect.apply(reflected.reverse, reflected, []);
  const {
    0: {
      getOwnPropertyNames
    }
  } = reflected;
  return getOwnPropertyNames;
}();
export { repositionedByReflectApply };
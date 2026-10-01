import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.values";
import "core-js/modules/web.dom-collections.values";
// A nested read uses the object supplied to the container parameter.
const parameterContainer = function (incoming) {
  const {
    k: {
      values
    }
  } = incoming;
  return values;
}({
  k: Object
});
export { parameterContainer };
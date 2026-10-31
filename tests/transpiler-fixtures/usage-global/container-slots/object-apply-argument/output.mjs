import "core-js/modules/es.object.get-own-property-descriptor";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An apply argument array hands its contained object to the callee before the nested read.
function consume(first) {
  if (first) first.k = Map;
}
const escapedViaApplyArray = function () {
  const applyBox = {
    k: Object
  };
  consume.apply(null, [applyBox]);
  const {
    k: {
      getOwnPropertyDescriptor
    }
  } = applyBox;
  return getOwnPropertyDescriptor;
}();
export { escapedViaApplyArray };
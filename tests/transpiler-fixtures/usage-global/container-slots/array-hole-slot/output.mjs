import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.keys";
import "core-js/modules/web.dom-collections.keys";
// A hole supplies no element value; the nested pattern remains a native read.
const overHole = function () {
  const {
    1: {
      keys
    }
  } = [[8],, [9]];
  return keys;
}();
export { overHole };
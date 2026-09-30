import "core-js/modules/es.object.keys";
import "core-js/modules/es.json.stringify";
// Passing a data-only configuration object leaves a separate constructor container unchanged.
const configObjectIsNoContainer = function () {
  const config = {
    handler() {
      return 1;
    },
    limit: 5
  };
  JSON.stringify(config);
  const neighbour = {
    k: Object
  };
  const {
    k: {
      keys
    }
  } = neighbour;
  return keys;
}();
export { configObjectIsNoContainer };
import _JSON$stringify from "@core-js/pure/actual/json/stringify";
import _Object$keys from "@core-js/pure/actual/object/keys";
// Passing a data-only configuration object leaves a separate constructor container unchanged.
const configObjectIsNoContainer = function () {
  const config = {
    handler() {
      return 1;
    },
    limit: 5
  };
  _JSON$stringify(config);
  const neighbour = {
    k: Object
  };
  const {
    k: {
      keys
    }
  } = {
    k: {
      keys: _Object$keys
    }
  };
  return keys;
}();
export { configObjectIsNoContainer };
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set";
// Inner defaults replace their receiver whole where a mirror can carry its keys.
// Quoted keys retain native reads; declined rest and unknown supplied receivers stay native.
// Member targets and repeated flat keys retain the same mirror as ordinary bindings.
const getKey = () => 'Map';
export const keyed = (() => {
  const {
    k: {
      Set: KS,
      [getKey()]: y,
      Array: {
        of: kof
      }
    } = {
      Set: _Set,
      Map: _Map,
      Array: {
        of: _Array$of
      }
    }
  } = {};
  const {
    k: {
      Array: {
        of: only
      }
    } = {
      Array: {
        of: _Array$of
      }
    }
  } = {};
  return [KS, y, kof, only];
})();
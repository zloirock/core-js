import _Map from "@core-js/pure/actual/map/constructor";
import _Object$keys from "@core-js/pure/actual/object/keys";
// Reading an alias of one constructor slot leaves a different constructor slot available.
const aliasLeakIsPairPrecise = function () {
  const twoSlots = {
    M: _Map,
    P: Object
  };
  const aliasM = twoSlots.M;
  void aliasM;
  const {
    P: {
      keys
    }
  } = {
    P: {
      keys: _Object$keys
    }
  };
  return keys;
}();
export { aliasLeakIsPairPrecise };
import _Object$defineProperties from "@core-js/pure/actual/object/define-properties";
// Object.defineProperties with literal-keyed descriptors rebinds multiple
// statics in one call. each key must be tracked the same way as defineProperty
// so all subsequent calls preserve the runtime override.
_Object$defineProperties(Array, {
  from: {
    value: function () {
      return [];
    }
  },
  isArray: {
    value: function () {
      return false;
    }
  }
});
Array.from([1, 2, 3]);
Array.isArray([4]);
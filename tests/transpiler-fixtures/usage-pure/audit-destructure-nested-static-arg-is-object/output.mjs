import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$keys from "@core-js/pure/actual/object/keys";
// destructure nested inside a static-method call whose arg is an object literal: the
// rewrite must thread through the literal arg without breaking the destructure.
const {
  Object: {
    freeze,
    keys
  }
} = {
  Object: {
    freeze: _Object$freeze,
    keys: _Object$keys
  }
};
keys(freeze({
  a: 1
}));
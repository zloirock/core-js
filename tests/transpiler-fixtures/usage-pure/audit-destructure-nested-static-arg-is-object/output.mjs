import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$keys from "@core-js/pure/actual/object/keys";
const freeze = _Object$freeze;
const keys = _Object$keys;
keys(freeze({
  a: 1
}));
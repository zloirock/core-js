import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
var _ref, _ref2;
// An array assignment capture preserves the stored realm and the rest exclusion around Object.keys.
// The bare Array element keeps its native of/rest pattern and neighbouring binding.
let keys, realmRest, saved;
[_ref] = [saved = (effect(), _globalThis)], {
  Object: {},
  ...(_ref2 = [keys = _Object$keys])[0]
} = _ref, realmRest = _ref2[0];
let of, ctorRest, tail;
[{
  of,
  ...ctorRest
}, tail] = [Array, 7];
use(keys, realmRest, saved, of, ctorRest, tail);
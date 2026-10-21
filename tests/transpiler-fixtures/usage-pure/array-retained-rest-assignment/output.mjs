import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
var _ref, _unused;
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
let keys, realmRest, saved;
[_ref] = [saved = (effect(), _globalThis)], _ref.Object, keys = _Object$keys, {
  Object: _unused,
  ...realmRest
} = _ref;
let of, ctorRest, tail;
[{
  of,
  ...ctorRest
}, tail] = [Array, 7];
use(keys, realmRest, saved, of, ctorRest, tail);
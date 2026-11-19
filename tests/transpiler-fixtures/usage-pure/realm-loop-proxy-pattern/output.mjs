import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// The pattern owns its anchor when its source is a for-of binding.
export const r = [];
for (const realm of [_globalThis]) {
  const {
      Array: {
        prototype: _ref
      }
    } = _globalThis,
    at = _atMaybeArray(_ref),
    includes = _includesMaybeArray(_ref);
  _pushMaybeArray(r).call(r, typeof at, typeof includes);
}
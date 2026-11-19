import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// Shared readers capture the receiver after preceding effects; a sole read carries its prefix.
const lead = before(),
  {
    Array: {
      prototype: _ref
    }
  } = (effect(), _globalThis),
  at = _atMaybeArray(_ref),
  includes = _includesMaybeArray(_ref),
  {
    Object: C
  } = _globalThis;
const flat = _flatMaybeArray((another(), _globalThis.Array.prototype));
use(lead, at, includes, C, flat);
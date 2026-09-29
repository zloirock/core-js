import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
const _ref = (0, Array);
export const at = _atMaybeArray(_ref.prototype);
// A literal slot memoized because its leaves navigate on into a built-in surface holds the namespace
// itself: every leaf off that memo reads the surface through it, a later leaf as the first one. A
// memo of the user's own object names no surface, and its leaves keep the source's own reads.
export const flat = _flatMaybeArray(_ref.prototype);
const _ref2 = (0, _globalThis);
export const fill = _fillMaybeArray(_ref2.Array.prototype);
export const includes = _includesMaybeArray(_ref2.Array.prototype);
const registry = {
  Model: {
    prototype: [1, 2]
  }
};
export const {
  user: {
    Model: {
      prototype: {
        findLast,
        toSorted
      }
    }
  }
} = {
  user: (0, registry)
};
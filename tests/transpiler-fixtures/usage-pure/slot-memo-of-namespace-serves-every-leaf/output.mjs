import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _globalThis from "@core-js/pure/actual/global-this";
// A literal slot memoized because its leaves navigate on into a built-in surface holds the namespace
// itself: every leaf off that memo reads the surface through it, a later leaf as the first one. A
// memo of the user's own object names no surface, and its leaves keep the source's own reads.
const {
    slot: {
      prototype: _ref
    }
  } = {
    slot: (0, Array)
  },
  at = _atMaybeArray(_ref),
  flat = _flatMaybeArray(_ref);
export { at, flat };
const {
    realm: {
      Array: {
        prototype: _ref2
      }
    }
  } = {
    realm: (0, _globalThis)
  },
  fill = _fillMaybeArray(_ref2),
  includes = _includesMaybeArray(_ref2);
export { fill, includes };
const registry = {
  Model: {
    prototype: [1, 2]
  }
};
const {
    user: {
      Model: {
        prototype: _ref3
      }
    }
  } = {
    user: (0, registry)
  },
  findLast = _findLastMaybeArray(_ref3),
  toSorted = _toSortedMaybeArray(_ref3);
export { findLast, toSorted };
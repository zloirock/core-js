import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// An undecided nested selection evaluates only the selected effectful call, once, and serves `from`
// for that arm. A plain sibling follows the selected receiver; pure Iterator retains the existing
// pure-constructor whole-swap boundary rather than reading the ambient constructor object.
export function select(first, second) {
  let calls = 0;
  const {
    from,
    custom
  } = first ? function (_ref) {
    return {
      from: _Array$from,
      get custom() {
        return _ref.custom;
      }
    };
  }((() => {
    calls++;
    return Array;
  })()) : second ? function (_ref2) {
    return {
      from: _Iterator$from,
      get custom() {
        return _ref2.custom;
      }
    };
  }((() => {
    calls++;
    return _Iterator;
  })()) : (Array, {
    from: _Array$from,
    get custom() {
      return Array.custom;
    }
  });
  return [from, custom, calls];
}
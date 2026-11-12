import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A memoized fallback can serve multiple instance leaves with one invocation.
// Its result is captured once before the two method reads.
export function read(box) {
  function use({
    y: {
      at,
      includes
    } = (_ref => {
      return _ref == null ? _ref : {
        get at() {
          return _at(_ref);
        },
        get includes() {
          return _includes(_ref);
        }
      };
    })(fallback())
  } = {
    y: (_ref2 => {
      return _ref2 == null ? _ref2 : {
        get at() {
          return _at(_ref2);
        },
        get includes() {
          return _includes(_ref2);
        }
      };
    })(box.list)
  }) {
    return [at, includes];
  }
  return use();
}
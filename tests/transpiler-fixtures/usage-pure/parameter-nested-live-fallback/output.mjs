import _at from "@core-js/pure/actual/instance/at";
// An undefined literal slot reaches its own fallback before dispatch.
// Null still throws; it is not replaced by an always-defined mirror.
export function read(box) {
  function use({
    y: {
      at
    } = (_ref => {
      return _ref == null ? _ref : {
        get at() {
          return _at(_ref);
        }
      };
    })(fallback())
  } = {
    y: (_ref2 => {
      return _ref2 == null ? _ref2 : {
        get at() {
          return _at(_ref2);
        }
      };
    })(box.list)
  }) {
    return at;
  }
  return use();
}
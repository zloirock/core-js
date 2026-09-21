import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// Capturing an instance leaf keeps outer static siblings live.
// A preceding declarator rewrite must also preserve a queued computed read.
export function captured(effect) {
  let held;
  const [{
    Array: {
      prototype: {
        at
      }
    },
    Object: {
      keys
    },
    other
  }] = [(held = (effect(), _globalThis), {
    Array: {
      prototype: {
        at: _atMaybeArray(_globalThis.Array.prototype)
      }
    },
    Object: {
      keys: _Object$keys
    },
    other: _globalThis.other
  })];
  return [at, keys, other, held];
}
export function following(effect) {
  const {
      Array: {
        from
      }
    } = {
      Array: {
        from: _Array$from
      }
    },
    _ref = Array.prototype,
    flat = null == _ref ? _ref[""] : (effect(), _flatMaybeArray(_ref));
  return [from, flat];
}
import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
export function captured(effect) {
  let held;
  const [_ref] = [held = (effect(), _globalThis)];
  const at = _atMaybeArray(_ref.Array.prototype);
  const {
    Object: {
      keys
    }
  } = {
    Object: {
      keys: _Object$keys
    }
  };
  const {
    other
  } = _ref;
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
    flat = (effect(), _flatMaybeArray(Array.prototype));
  return [from, flat];
}
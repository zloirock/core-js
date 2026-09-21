import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// A flattened globalThis.Array.from leaf shares its declaration with an effectful computed Array.of
// key. The second receiver is captured at its own declarator, then the key effect runs once before
// the pure Array.of binding.
const effects = [];
const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  _ref = Array,
  of = null == _ref ? _ref[""] : (_pushMaybeArray(effects).call(effects, 'k'), _Array$of);
export const r = [typeof from, typeof of, effects.length];
export { effects };
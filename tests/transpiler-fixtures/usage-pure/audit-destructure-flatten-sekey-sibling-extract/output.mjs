import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// A globalThis.Array.from leaf, mirrored in place, shares its declaration with an effectful computed
// Array.of key: the key effect runs once before the pure Array.of binding, and the proven constructor
// receiver needs no capture of its own.
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
  of = (_pushMaybeArray(effects).call(effects, 'k'), _Array$of);
export const r = [typeof from, typeof of, effects.length];
export { effects };
import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// BOTH effects around a folded SE-key static extraction survive in native order: the receiver's
// sequence prefix (runs first, with the init) and the plus-fold computed-key effect (runs second,
// in the kept residual key). the extraction still binds the pure static
const e = [];
const from = _Array$from;
const {
  [(_pushMaybeArray(e).call(e, 'k'), 'fr') + 'om']: _unused
} = (_pushMaybeArray(e).call(e, 'r'), Array);
export const r = [from, e];
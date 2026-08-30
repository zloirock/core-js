import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// BOTH effects around a folded SE-key static extraction survive in native order: the receiver's
// sequence prefix LIFTS ahead of the extraction (the source ran it before the pattern bound
// anything) and the plus-fold computed-key effect runs second, in the kept residual key, off the
// bare tail the lift left there. the extraction still binds the pure static
const e = [];
_pushMaybeArray(e).call(e, 'r');
const from = _Array$from;
const {
  [(_pushMaybeArray(e).call(e, 'k'), 'fr') + 'om']: _unused
} = Array;
export const r = [from, e];
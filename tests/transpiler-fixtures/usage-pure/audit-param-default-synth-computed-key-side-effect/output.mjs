import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a side effect buried in a COMPUTED member key on a function-param-default destructure receiver.
// the receiver is a synth-swap target - it collapses to the pure constructor - so the whole receiver
// value is discarded; the computed-key effect must still survive that collapse and run. covers a key
// at a spine hop (`globalThis[(se, 'self')].Array`) and at the receiver's OWN key
// (`globalThis[(se, 'Array')]`). distinct methods so each line's injected import is unambiguous
let spineKeyReads = 0;
let ownKeyReads = 0;
function withOf({
  of
} = (spineKeyReads++, {
  of: _Array$of
})) {
  return of;
}
function withFrom({
  from
} = (_globalThis[ownKeyReads++, 'Array'], {
  from: _Array$from
})) {
  return from;
}
export { withOf, withFrom };
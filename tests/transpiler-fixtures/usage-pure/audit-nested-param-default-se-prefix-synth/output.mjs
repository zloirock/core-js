import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// a parameter default with an effect prefix beside the receiver read: the prefix is KEPT
// (re-emitted ahead of the literal, runs on the no-argument call exactly as native) and only
// the effect-free receiver tail is replaced by the mirrored literal
const log = [];
function f({
  Array: {
    from
  }
} = (_pushMaybeArray(log).call(log, 1), {
  Array: {
    from: _Array$from
  }
})) {
  return [from, log.length];
}
f();
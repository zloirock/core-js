import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// a computed key consuming the whole declaration runs its effect after the init's: the effect prefix of
// the operand the build decides runs first, where the source ran it
export const log = [];
export const from = (_pushMaybeArray(log).call(log, 'init'), _pushMaybeArray(log).call(log, 'key'), _Iterator$from);
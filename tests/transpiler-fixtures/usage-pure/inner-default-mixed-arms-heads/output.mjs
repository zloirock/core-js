import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set/constructor";
// A receiver-bearing default runs only for an undefined source slot. Nested constructor and static claims must share that
// condition and preserve a supplied foreign value.
const held = {
  Set: function HeldSet() {
    return held;
  },
  Array: {
    of: x => [x, 'held']
  }
};
const rows = [[], [held]];
export const heads = [];
for (const [{
  Set: S,
  Array: {
    of
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  }
}] of rows) (_pushMaybeArray(heads) || 0).call(heads, S, of(7));
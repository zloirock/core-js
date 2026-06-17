import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// A conditional-receiver destructure whose key IS polyfillable on both branches (Array.from /
// Iterator.from), but the pattern also binds a computed key off a bare global constructor ([Set]),
// which per-branch synth-swap cannot fold into a synth literal (it would emit `Set` raw and throw on
// the target). The whole pattern bails registration, so the genuine `from` candidate is left untouched
// - a real "runtime availability depends on the selected branch" case. Both emitters emit the single-
// sourced debug warning for `from`; the non-candidate `[Set]` key is gated out (no false warning).
const cond = true;
const {
  from,
  [_Set]: ctor
} = cond ? Array : _Iterator;
from([1, 2, 3]);
ctor;
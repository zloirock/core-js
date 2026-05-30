import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// per-branch synth-swap where one conditional branch is a SequenceExpression whose tail is a
// proxy-global member (`(log(), globalThis.Array)`). the synth swap overwrites the SE tail, so
// the receiver's proxy-global root must be skip-marked through the SE - otherwise the natural
// visitor substitutes the root inside the span the swap later overwrites. SE prefix runs at runtime
const {
  from
} = cond ? (log(), {
  from: _Array$from
}) : _Set;
from([1]);
import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set/constructor";
// per-branch synth-swap where one conditional branch is a SequenceExpression with MULTIPLE
// prefix calls and a proxy-global member tail (`(log(), warn(), globalThis.Array)`). the synth
// swap overwrites the SE tail, so the receiver's proxy-global root must be skip-marked through
// the whole sequence - otherwise the natural visitor substitutes the root inside the span the
// swap later overwrites and compose crashes. both prefix calls stay and run at runtime
const {
  of
} = cond ? (log(), warn(), {
  of: _Array$of
}) : _Set;
of([1]);
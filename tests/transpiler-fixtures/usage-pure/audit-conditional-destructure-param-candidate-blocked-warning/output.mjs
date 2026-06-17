import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// The parameter-default form of a structurally-blocked conditional destructure: `from` is polyfillable
// on both branches but the [Set] computed key bails per-branch synth, so the genuine candidate is left
// untouched. Routes the warn through the parameter path (distinct from the declarator path); the warn
// is single-sourced and gated on a real candidate in both emitters.
const cond = true;
function pick({
  from,
  [_Set]: ctor
} = cond ? Array : _Iterator) {
  return [from, ctor];
}
pick();
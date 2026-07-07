import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a synth-swap receiver that is a proxy-global member chain with a PURE-CONSTRUCTOR leaf
// whole-swaps the unpolyfilled-key re-read target to the pure constructor import
// (`_Map.other`) - the nested partial-mirror canon; the collapse target is one shared plan
// decision, so both emitters render the identical target and import set
function deepHop({
  groupBy,
  other
} = {
  groupBy: _Map$groupBy,
  other: _Map.other
}) {
  return [groupBy, other];
}
deepHop();

// IIFE-arg host, single hop: the same canon through the arrow-param synth-swap route
const viaIife = (({
  try: t,
  missing
} = {
  try: _Promise$try,
  missing: _Promise.missing
}) => [t, missing])();

// alias root: the pure-ctor whole-swap wins over the alias-keep branch - the alias only
// carries the chain to the plan, the leaf decides the re-read target
const g = _globalThis;
function aliasRoot({
  groupBy: gb,
  more
} = {
  groupBy: _Map$groupBy,
  more: _Map.more
}) {
  return [gb, more];
}
aliasRoot();

// a fully-polyfillable pure-global leaf is RETAINED and whole-swapped instead (no synth
// literal): the unpolyfilled sibling destructures off the pure constructor directly
function retainedLeaf({
  range,
  other
} = _Iterator) {
  return [range, other];
}
retainedLeaf();
import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _self from "@core-js/pure/actual/self";
// a synth-swap receiver whose navigation SHORT-CIRCUITS: the mirror supplants the whole nav, so the
// kept-nav render must stand down on it rather than claim the same span, and a key the mirror leaves
// unpolyfilled must re-read through a SUBSTITUTED root - a raw global there is the ReferenceError
// the substitution exists to prevent. the last row is the boundary: no polyfillable root, stays raw
export function overAHop({
  of,
  from
} = {
  of: _Array$of,
  from: _Array$from
}) {
  return [of, from];
}
export function unpolyfilledSibling({
  groupBy,
  other
} = {
  groupBy: _Map$groupBy,
  other: _Map.other
}) {
  return [groupBy, other];
}
export const viaIifeArgument = (({
  entries,
  other
}) => [entries, other])({
  entries: _Object$entries,
  other: (null == _globalThis.window ? void 0 : _self.Object).other
});
// the two rows the sealed render does NOT take: the guarded hop sits directly under the leaf, so the
// unpolyfilled key re-reads through the chain itself - which is where the root has to be substituted
// by hand, or a raw global reaches the output
export function directlyUnderTheGuard({
  of,
  other
} = {
  of: _Array$of,
  other: (_globalThis.window?.Array).other
}) {
  return [of, other];
}
export const viaIifeUnderTheGuard = (({
  of,
  other
}) => [of, other])({
  of: _Array$of,
  other: (_globalThis.window?.Array).other
});
export function foreignRoot({
  of,
  other
} = host.thing?.Array) {
  return [of, other];
}
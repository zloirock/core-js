import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _self from "@core-js/pure/actual/self";
// Optional realm navigation supplies static polyfills while supplied arguments retain their nullish branch.
// Unpolyfilled sibling keys read through a substituted realm root on the live branch.
// Parameter defaults synthesize covered keys even when the optional host is absent.
// A receiver rooted in an unknown host keeps its original navigation.
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
}) => [entries, other])(null == _globalThis.window ? void 0 : {
  entries: _Object$entries,
  other: _self.Object.other
});
// The guard can sit directly below the constructor. The supplied argument retains its nullish branch,
// while the parameter default still reads its unresolved sibling through the optional receiver.
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
}) => [of, other])(null == _globalThis.window ? void 0 : {
  of: _Array$of,
  other: _globalThis.Array.other
});
export function foreignRoot({
  of,
  other
} = host.thing?.Array) {
  return [of, other];
}
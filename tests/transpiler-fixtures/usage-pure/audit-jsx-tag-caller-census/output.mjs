import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// Rest-bearing parameters keep their native bindings and defaults in parameter scope.
// Independent reads and key/default expressions still receive their own polyfills.
function TagName({
  from,
  ...rest
} = Array) {
  return [from, rest];
}
function PairedTag({
  of,
  ...rest
} = Array) {
  return [of, rest];
}
function MemberRoot({
  entries,
  ...rest
} = Object) {
  return [entries, rest];
}
function DeepMemberRoot({
  keys,
  ...rest
} = Object) {
  return [keys, rest];
}
function lowerRoot({
  values,
  ...rest
} = Object) {
  return [values, rest];
}
function noTag({
  fromEntries: _unused,
  ...rest
} = Object) {
  let fromEntries = _Object$fromEntries;
  return [fromEntries, rest];
}
export const control = noTag();
export const elements = [<TagName x={1} />, <PairedTag x={1}></PairedTag>, <MemberRoot.Sub x={1} />, <DeepMemberRoot.A.B x={1} />, <lowerRoot.Sub x={1} />];
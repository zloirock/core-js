import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// A JSX tag name is a CALLER the file never spells: the element hands the component to a renderer
// that invokes it with props, so a parameter default the extract folds away can still be overridden.
// A function DECLARATION learns that only from the program-wide reference census - the enclosing
// expression says nothing - so every tag slot that references keeps the pattern VERBATIM. The rest
// element is what makes the extract the only caller-lossy option, so the decision is really on the table.
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

// A MEMBER tag is an expression whatever its case - the intrinsic spelling rule must not reach it.
function lowerRoot({
  values,
  ...rest
} = Object) {
  return [values, rest];
}

// CONTROL: the same shape named by no tag at all. Every call site is visible, so the extract stands -
// without it an emitter that stopped extracting anywhere would read this file as a pass.
function noTag({
  fromEntries: _unused,
  ...rest
} = Object) {
  let fromEntries = _Object$fromEntries;
  return [fromEntries, rest];
}
export const control = noTag();
export const elements = [<TagName x={1} />, <PairedTag x={1}></PairedTag>, <MemberRoot.Sub x={1} />, <DeepMemberRoot.A.B x={1} />, <lowerRoot.Sub x={1} />];
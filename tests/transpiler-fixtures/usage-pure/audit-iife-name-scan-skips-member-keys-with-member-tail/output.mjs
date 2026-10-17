import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
const withMemberTail = function n({
  fromEntries: _unused,
  ...rest
} = Object) {
  let fromEntries = _Object$fromEntries;
  const o = {};
  o.n = 1;
  return [fromEntries, rest, o];
}();
export { withMemberTail };
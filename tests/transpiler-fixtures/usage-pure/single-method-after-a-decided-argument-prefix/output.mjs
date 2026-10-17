import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A decided caller argument runs its prefix before its sole instance read.
// With no later parameter or argument work, that read needs no deferred wrapper.
let effects = 0;
export const method = ((_ref, _unused = void 0) => {
  let at = _atMaybeArray(_ref);
  return at;
})((effects++, []));
export { effects };
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Object$assign from "@core-js/pure/actual/object/assign";
// a REST inside the LEAF travels with it: the twin keeps the leaf's own pattern, so the rest gathers
// off the memo instead of the source read - and the claim's key stays there as a sentinel, still
// excluding itself from what the rest collects, which is what native does
const box = {
  y: _Object$assign([1, [2]], {
    extra: 7
  })
};
const bare = function () {
  const _ref = box.y;
  const flat = _flatMaybeArray(_ref);
  const {
    flat: _unused,
    ...rest
  } = _ref;
  return [flat, rest.extra, 'flat' in rest];
}();
// ... and a sibling BINDING beside the rest keeps its own key out of it too
const withSibling = function () {
  const _ref2 = box.y;
  const flat = _flatMaybeArray(_ref2);
  const {
    flat: _unused2,
    extra,
    ...rest
  } = _ref2;
  return [flat, extra, Object.keys(rest).length];
}();
// ... and two claims off one leaf share the memo the rest reads
const twoClaims = function () {
  const _ref3 = box.y;
  const flat = _flatMaybeArray(_ref3);
  const at = _atMaybeArray(_ref3);
  const {
    flat: _unused3,
    at: _unused4,
    ...rest
  } = _ref3;
  return [flat, at, 'flat' in rest, 'at' in rest];
}();
// ... and the array WRAPPER host answers the same, its element reached through the binding
const wrapped = function () {
  const _ref4 = box.y;
  const flat = _flatMaybeArray(_ref4);
  const [{
    flat: _unused5,
    ...rest
  }] = [_ref4];
  return [flat, rest.extra];
}();
export { bare, withSibling, twoClaims, wrapped };
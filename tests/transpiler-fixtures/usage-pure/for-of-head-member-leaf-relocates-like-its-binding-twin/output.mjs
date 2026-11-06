import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A member target one level down a for-of head relocates the head like its binding twin: an instance claim
// over an unknown iterable then takes its dispatch in the body instead of staying a native read.
const o = {};
for (const _ref of list) {
  o.l = _flatMaybeArray(_ref.Array);
  ;
}
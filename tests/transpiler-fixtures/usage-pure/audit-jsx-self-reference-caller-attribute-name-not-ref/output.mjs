import _Object$assign from "@core-js/pure/actual/object/assign";
// An attribute NAME is a prop name, not a binding reference - no extra caller either way.
export const attributeNameNotRef = function H({
  ['assign']: assign
} = {
  ['assign']: _Object$assign
}) {
  return <div H={1}>{assign({}, {
      a: 1
    }).a}</div>;
}();
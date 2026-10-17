// An attribute NAME is a prop name, not a binding reference - no extra caller either way.
export const attributeNameNotRef = (function H({ ['assign']: assign } = Object) {
  return <div H={1}>{assign({}, { a: 1 }).a}</div>;
})();

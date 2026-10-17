export const attributeNameNotRef = (function H({ assign, ...rest } = Object) {
  return <div H={1}>{assign({}, rest, { a: 1 }).a}</div>;
})();

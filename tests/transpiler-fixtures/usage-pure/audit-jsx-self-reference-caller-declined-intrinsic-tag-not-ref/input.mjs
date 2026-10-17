export const intrinsicTagNotRef = (function div({ values, ...rest } = Object) {
  return <div>{values(rest).length}</div>;
})();

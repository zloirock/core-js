// A lowercase BARE tag names an intrinsic element - the string, not the binding of that same
// spelling - so it adds no caller at all.
export const intrinsicTagNotRef = (function div({ ['values']: values } = Object) {
  return <div>{values({ a: 1 }).length}</div>;
})();

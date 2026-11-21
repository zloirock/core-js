// A mutator invoked through call changes the same array receiver as a direct invocation.
const repositionedByDetachedCall = (function () {
  const called = [Object, Map];
  called.reverse.call(called);
  const { 0: { groupBy } } = called;
  return groupBy;
})();
export { repositionedByDetachedCall };

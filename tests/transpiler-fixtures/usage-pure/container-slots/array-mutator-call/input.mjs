// A mutator invoked through call changes the same array receiver as a direct invocation.
const repositionedByDetachedCall = (function () {
  const called = [Object];
  called.reverse.call(called);
  const { 0: { getOwnPropertyDescriptor } } = called;
  return getOwnPropertyDescriptor;
})();
export { repositionedByDetachedCall };

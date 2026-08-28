// a nav init that a residual survives is memoized so both readers share ONE read - and an OPTIONAL
// nav is such an init like any other: the `?.` rides inside the memo, and the dispatch and the
// surviving residual read the ref. spelling it twice would fire the hop's getter twice
const box = { y: [1, [2]] };
const single = (function () {
  const { at, other } = box?.y;
  return [at, other];
})();
const chained = (function () {
  const deep = { y: { z: [1, [2]] } };
  const { flat, other } = deep?.y?.z;
  return [flat, other];
})();
export { single, chained };

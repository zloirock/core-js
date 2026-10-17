const crossFamilyFold = (function () {
  const nb = { y: [1, 2] };
  const { y: { at, other } = 'ab' } = nb;
  return [at, other];
})();
export { crossFamilyFold };

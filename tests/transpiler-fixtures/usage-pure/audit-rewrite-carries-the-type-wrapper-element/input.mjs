const wrapperElement = (function () {
  const nb = { y: 'ab' };
  const [{ y: { at } }] = [nb];
  return at;
})();
export { wrapperElement };

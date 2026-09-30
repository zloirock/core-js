// An index read through a spread keeps the selected runtime element as its receiver.
const spreadSrc = [[9]];
const overSpread = (function () {
  const { 0: { values } } = [...spreadSrc];
  return values;
})();
export { overSpread };

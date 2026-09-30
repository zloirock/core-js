// A noncanonical numeric string names an ordinary property rather than an array element.
const nonCanonicalSpelling = (function () {
  const { '01': { entries } } = [[11]];
  return entries;
})();
export { nonCanonicalSpelling };

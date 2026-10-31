// A nested instance read through an array wrapper shares its selected slot with surviving
// leaf siblings. The method keeps the same receiver-family narrowing as the flat spelling.
const box = { y: [1, [2]] };
const wrapped = (function () {
  const [{ y: { at, other } }] = [box];
  return [at, other];
})();
export { wrapped };

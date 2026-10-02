// A local catch alias writes the held constructor slot before it is read.
// The catch itself hands no constructor out; the written slot still contributes its own family.
const escapedByThrow = (function () {
  const thrownBox = { k: Object };
  try { throw thrownBox; } catch (caught) { caught.k = Map; }
  const { k: { create: viaThrow } } = thrownBox;
  return viaThrow;
})();
export { escapedByThrow };

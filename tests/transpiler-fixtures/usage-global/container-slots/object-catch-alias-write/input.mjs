// A locally caught object is written through the catch alias before its constructor slot is read.
const escapedByThrow = (function () {
  const thrownBox = { k: Object };
  try { throw thrownBox; } catch (caught) { caught.k = Map; }
  const { k: { create: viaThrow } } = thrownBox;
  return viaThrow;
})();
export { escapedByThrow };

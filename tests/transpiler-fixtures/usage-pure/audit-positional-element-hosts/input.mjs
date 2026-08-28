// the pair lands by the slot its host stands in: an unbraced control body gets BRACED around it, a
// LOOP HEAD takes it as declarators (they evaluate in order, so the minted name is bound first), a
// CATCH param relocates into the body and extracts there, a flatten sibling splits the declaration
// around it, and an exported host binding nothing else drops its wrapper onto the extraction
const rows = [[1, [2]], [3]];
const bodyless = (function () {
  if (rows.length) var [{ at }] = rows;
  return at;
})();
const loopInit = (function () {
  for (var [{ at }] = rows, i = 0; i < 1; i++);
  return at;
})();
const caught = (function () {
  try { throw rows; } catch ([{ at }]) { return at; }
})();
const besideFlatten = (function () {
  var { Array: { from: xf } } = globalThis, [{ at }] = rows;
  return [typeof xf, at];
})();
export const [{ at: exportedSole }] = rows;
export { bodyless, loopInit, caught, besideFlatten };

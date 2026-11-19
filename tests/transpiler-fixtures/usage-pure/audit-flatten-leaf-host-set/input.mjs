// Nested leaves share a captured receiver with their remaining properties. A loop head uses
// declarators; an unbraced slot is braced. A shared declaration preserves both neighbours around a
// middle capture. An export whose only nested level keeps siblings still follows its existing
// native boundary.
const box = { y: [1, [2]] };
function effect() { return 1; }
export const { y: { at: exported, other: exportedOther } } = box;
const bodyless = (function () {
  if (box) var { y: { at, other } } = box;
  return [at, other];
})();
const loopHead = (function () {
  for (var { y: { at, other } } = box, i = 0; i < 1; i++);
  return [at, other];
})();
const sharedDeclaration = (function () {
  var z = 1, { y: { at, other } } = box;
  return [z, at, other];
})();
const middleDeclarator = (function () {
  var z = 1, { y: { at, other } } = box, zTail = 2;
  return [z, at, other, zTail];
})();
export { bodyless, loopHead, sharedDeclaration, middleDeclarator };

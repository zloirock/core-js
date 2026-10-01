// Positional captures keep native evaluation order across loop headers, control bodies, catches and exports.
// Sibling rewrites retain their own claims and internal temporaries.
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

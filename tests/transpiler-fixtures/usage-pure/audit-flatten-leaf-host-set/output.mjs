import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Nested leaves share a captured receiver with their remaining properties. A loop head uses
// declarators; an unbraced slot is braced. A shared declaration preserves both neighbours around a
// middle capture. An export whose only nested level keeps siblings still follows its existing
// native boundary.
const box = {
  y: [1, [2]]
};
function effect() {
  return 1;
}
const {
    y: _ref
  } = box,
  exported = _atMaybeArray(_ref),
  {
    other: exportedOther
  } = _ref;
export { exported, exportedOther };
const bodyless = function () {
  if (box) var {
      y: _ref2
    } = box,
    at = _atMaybeArray(_ref2),
    {
      other
    } = _ref2;
  return [at, other];
}();
const loopHead = function () {
  for (var {
      y: _ref3
    } = box, at = _atMaybeArray(_ref3), {
      other
    } = _ref3, i = 0; i < 1; i++);
  return [at, other];
}();
const sharedDeclaration = function () {
  var z = 1,
    {
      y: _ref4
    } = box,
    at = _atMaybeArray(_ref4),
    {
      other
    } = _ref4;
  return [z, at, other];
}();
const middleDeclarator = function () {
  var z = 1,
    {
      y: _ref5
    } = box,
    at = _atMaybeArray(_ref5),
    {
      other
    } = _ref5,
    zTail = 2;
  return [z, at, other, zTail];
}();
export { bodyless, loopHead, sharedDeclaration, middleDeclarator };
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// the leaf flatten renders a memo plus its extractions, and the slot the declaration stands in is
// what decides where that pair goes: a statement list splices it, a LOOP HEAD takes it as
// declarators (they evaluate in order, so the memo binds first), and an unbraced slot gets braced
// around it. a SHARED declaration keeps its node and the claim's declarator leaves the list, so the
// pair stands beside it - which needs an END of that list to stand at. an EXPORT wrapper is the one
// host that declines: the memo cannot lift out of it without exporting a name the source never wrote
const box = {
  y: [1, [2]]
};
function effect() {
  return 1;
}
export const {
  y: {
    at: exported,
    other: exportedOther
  }
} = box;
const bodyless = function () {
  if (box) {
    const _ref = box.y;
    var at = _atMaybeArray(_ref);
    var {
      other
    } = _ref;
  }
  return [at, other];
}();
const loopHead = function () {
  for (var _ref2 = box.y, at = _atMaybeArray(_ref2), {
      other
    } = _ref2, i = 0; i < 1; i++);
  return [at, other];
}();
const sharedDeclaration = function () {
  var z = 1;
  const _ref3 = box.y;
  var at = _atMaybeArray(_ref3);
  var {
    other
  } = _ref3;
  return [z, at, other];
}();
const middleDeclarator = function () {
  var z = 1,
    {
      y: {
        at,
        other
      }
    } = box,
    zTail = 2;
  return [z, at, other, zTail];
}();
export { bodyless, loopHead, sharedDeclaration, middleDeclarator };
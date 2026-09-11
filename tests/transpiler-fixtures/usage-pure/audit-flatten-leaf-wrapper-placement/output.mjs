import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// an array WRAPPER is a host of its own for the leaf flatten: the twin lives in the literal's
// ELEMENT, so the nav goes there and the pattern takes the leaf. that placement moves the READ to
// where the literal builds, so it holds only while nothing stands between - and the DISPATCHER these
// rows get is the one a flat twin of the same slot gets, since the element is reached through a
// binding and the slot below it folds like any other binding's
const box = {
  y: [1, [2]]
};
function effect() {
  return 1;
}
const wrapped = function () {
  const _ref = box.y;
  const at = _atMaybeArray(_ref);
  const [{
    other
  }] = [_ref];
  return [at, other];
}();
// ... and where something DOES stand between - a neighbour element carrying an effect, or a
// declarator ahead of this one - the twin TRAILS the residual instead: the literal builds whole, the
// emptied pattern coerces the element, and the read happens after both, where the source performs
// it. an emptied residual holding no effects goes entirely, since the twin reads through the same
// element and coerces it just the same - and a declarator binding NOTHING beside one that binds is
// a shape `@babel/plugin-transform-destructuring` lowers wrong, dropping the sibling's binding
const wrappedBesideAnEffect = function () {
  const [{}, zn] = [box, effect()];
  const _ref2 = box.y;
  const at = _atMaybeArray(_ref2);
  const {
    other
  } = _ref2;
  return [at, other, zn];
}();
const wrappedAfterAnEffect = function () {
  const zLead = effect();
  const _ref3 = box.y;
  const at = _atMaybeArray(_ref3);
  const {
    other
  } = _ref3;
  return [zLead, at, other];
}();
// ... and the hosts a TRAILING twin cannot reach keep the claim native rather than reorder the read:
// a loop HEAD takes declarators and an unbraced slot takes one statement, so neither has a place to
// put a statement after the residual
const wrappedInLoopHead = function () {
  let out;
  for (const [{
    y: {
      at,
      other
    }
  }, zn] = [box, effect()]; !out;) out = [at, other, zn];
  return out;
}();
const wrappedInBodylessSlot = function () {
  let out;
  if (out === undefined) var [{
    y: {
      at,
      other
    }
  }, zn] = [box, effect()];
  return [at, other, zn];
}();
export { wrapped, wrappedBesideAnEffect, wrappedAfterAnEffect, wrappedInLoopHead, wrappedInBodylessSlot };
// an opaque construct writes through the scope chain with no reference to show for it, so a walk
// enumerating a binding's references holds a SUBSET: an element narrow decided there must bail
// rather than read the empty set as "nothing wrote". the read stands BEFORE the construct, where
// the flow layer keeps the binding's own narrow - leaving this walk the only thing deciding the
// element. the negative pins the reach: that call is not on the scope chain of an inner binding
const reached = [[1, 2]];
reached[0].at(0);
eval("reached[0] = 'ab'");
function scoped() {
  const kept = [[1, 2]];
  return kept[0].includes(1);
}

// the IIFE arrow body is `<proxy> || g()`: the realm LEFT is always truthy, so the right arm never runs
// and drops with the selection, its effect included - the mirrored object then stands alone at the
// arrow's expression-body start and must be parenthesised, or `=> {` parses as a block body
function f({ Array: { from } } = (() => globalThis || g())()) {
  return from;
}
f();

// the IIFE arrow body is `<proxy> || g()`: the realm LEFT is always truthy, but the right arm runs an
// effect of its own, so the logical stays and only its left is mirrored - the object then stands at the
// arrow's expression-body start and must be parenthesised, or `=> {` parses as a block body
function f({ Array: { from } } = (() => globalThis || g())()) {
  return from;
}
f();

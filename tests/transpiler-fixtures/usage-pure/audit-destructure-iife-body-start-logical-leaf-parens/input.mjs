// the receiver default is a zero-arg IIFE whose arrow body is `<proxy> || self`: the realm LEFT is
// always truthy, so the pure `self` arm is dead and the whole body collapses to the mirrored object -
// which then stands at the arrow's expression-body start and must be parenthesised, or `=> {` parses
// as a block body. the logical a kept right arm leaves standing is the kept-right-arm twin's
function f({ Array: { from } } = (() => globalThis || self)()) {
  return from;
}
f();

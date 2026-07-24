// the receiver default is a zero-arg IIFE whose arrow body is `<proxy> || self`: the value leaf
// mirrored into the pattern (`globalThis`, the logical's LEFT operand) sits at the arrow's
// expression-body start, so it must be parenthesised - otherwise the unplugin text splice emits
// `() => { ... } || self` and the `=> {` is parsed as a block body instead of an object literal
function f({ Array: { from } } = (() => globalThis || self)()) {
  return from;
}
f();

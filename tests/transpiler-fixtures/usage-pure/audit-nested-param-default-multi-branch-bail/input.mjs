// a sibling branch whose leaf is an INSTANCE method (`Set.union` lives on the prototype, not
// the constructor) cannot be mirrored as a static - the full-tree mirror bails. the function's
// visible calls never pass an argument, so the never-overridden refinement still polyfills the
// resolvable static leaf in place; the instance-method branch stays native
function f({ Array: { from }, Set: { union } } = globalThis) {
  return [from, union];
}
f();

// a static destructured off a hoisted, conditionally-initialised `var` renders the ctor-identity
// guard, and the claim asked AFTER that render reads through it: the type layer sees the guard's
// alternate - the source's own `G.from` - so the call's receiver narrows to the array helper
// exactly as the flat spelling `G.from(...)` does, instead of the generic one the rendered
// conditional used to resolve to
function f(cond) {
  if (cond) {
    var G = Array;
  }
  const { from } = G;
  return from([1, 2, 3]).at(0);
}

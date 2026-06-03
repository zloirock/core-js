// INSIDE the namespace body `g` is reachable, so usage-pure resolves the alias and rewrites
// `g.Array.from` to a pure import - and the `globalThis` initializer is substituted too. (contrast:
// the same use OUTSIDE the namespace cannot see the var and must stay verbatim)
namespace N {
  var g = globalThis;
  g.Array.from(iter);
}

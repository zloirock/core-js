import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// INSIDE the namespace body `g` is reachable, so usage-pure resolves the alias and rewrites
// `g.Array.from` to a pure import - and the `globalThis` initializer is substituted too. (contrast:
// the same use OUTSIDE the namespace cannot see the var and must stay verbatim)
namespace N {
  var g = _globalThis;
  _Array$from(iter);
}
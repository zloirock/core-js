import _globalThis from "@core-js/pure/actual/global-this";
// `var g` declared inside `namespace N` is namespace-scoped; the scope tracker over-hoists it to
// the enclosing module scope, so a use OUTSIDE the namespace must NOT resolve `g` to its
// `globalThis` initializer and rewrite `g.Array.from` to a pure import (the var is unreachable
// there). the genuine `globalThis` read inside the namespace body is still substituted
namespace N {
  var g = _globalThis;
}
g.Array.from(iter);
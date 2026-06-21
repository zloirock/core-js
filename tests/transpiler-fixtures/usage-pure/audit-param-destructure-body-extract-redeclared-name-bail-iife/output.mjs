import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// a destructured param may be legally redeclared by a body `var <name>` / `function <name>(){}`.
// the body-extract would emit a body-top `let <name> = <polyfill>`, but `let` + `var`/`function`
// on one name in a scope is a SyntaxError - so it must BAIL to the inline-default (no `let`) when
// the body already binds the name. `run` covers `var`, `make` the function-decl shape; `keep` is
// the no-over-bail control (its `var resolve` is in a NESTED scope, no collision, extract fires).
// immediately-invoked: every call site visible, so caller-lossy param emissions stay sound
(function run({
  from = _Array$from,
  ...rest
} = Array) {
  var from = 7;
  return [from, rest];
})();
(function make({
  of: of_,
  x: a
} = {
  of: _Array$of,
  x: Array.x
}) {
  function of_() {}
  return [of_, a];
})();
(function keep({
  resolve: _unused,
  ...rest
} = _Promise) {
  let resolve = _Promise$resolve;
  function inner() {
    var resolve = 1;
    return resolve;
  }
  return [resolve, rest, inner];
})();
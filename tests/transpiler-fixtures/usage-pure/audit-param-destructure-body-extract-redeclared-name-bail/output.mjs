import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// a destructured function PARAMETER may be legally redeclared by a function-scoped `var <name>` or
// `function <name>(){}` in the body (`node --check` parses both). the param-destructure body-extract
// would emit a body-top `let <name> = <polyfill>` aliasing the param - but `let` + `var`/`function`
// redeclaring one name in a single scope is a SyntaxError, turning valid input into broken output.
// the extract must BAIL to the inline-default fallback (which never introduces a `let`) when the body
// already binds the name. `run` covers the `var` shape, `make` the `function`-declaration shape.
// `keep` is the no-over-bail control: its `var resolve` lives in a NESTED function (a separate var
// scope), so it does NOT collide - the scan stops at nested functions and the body-extract `let
// resolve = <polyfill>` still happens. distinct globals/methods make each function's outcome unambiguous
function run({
  from = _Array$from,
  ...rest
} = Array) {
  var from = 7;
  return [from, rest];
}
function make({
  of: of_,
  x: a
} = {
  of: _Array$of,
  x: Array.x
}) {
  function of_() {}
  return [of_, a];
}
function keep({
  resolve: _unused,
  ...rest
} = _Promise) {
  let resolve = _Promise$resolve;
  function inner() {
    var resolve = 1;
    return resolve;
  }
  return [resolve, rest, inner];
}
export { run, make, keep };
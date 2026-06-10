// a destructured function PARAMETER may be legally redeclared by a function-scoped `var <name>` or
// `function <name>(){}` in the body (`node --check` parses both). the param-destructure body-extract
// would emit a body-top `let <name> = <polyfill>` aliasing the param - but `let` + `var`/`function`
// redeclaring one name in a single scope is a SyntaxError, turning valid input into broken output.
// the extract must BAIL to the inline-default fallback (which never introduces a `let`) when the body
// already binds the name. `run` covers the `var` shape, `make` the `function`-declaration shape.
// `keep` is the no-over-bail control: its `var resolve` lives in a NESTED function (a separate var
// scope), so it does NOT collide - the scan stops at nested functions and the body-extract `let
// resolve = <polyfill>` still happens. distinct globals/methods make each function's outcome unambiguous
// NOTE: these functions are EXPORTED - external callers are invisible, so the call-site scan
// cannot prove the default always applies and the params stay VERBATIM; the body-extract
// behavior is covered by the immediately-invoked twin fixture
function run({ from, ...rest } = Array) {
  var from = 7;
  return [from, rest];
}
function make({ of: of_, x: a } = Array) {
  function of_() {}
  return [of_, a];
}
function keep({ resolve, ...rest } = Promise) {
  function inner() { var resolve = 1; return resolve; }
  return [resolve, rest, inner];
}
export { run, make, keep };

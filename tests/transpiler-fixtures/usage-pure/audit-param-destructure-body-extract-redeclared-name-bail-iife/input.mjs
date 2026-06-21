// a destructured param may be legally redeclared by a body `var <name>` / `function <name>(){}`.
// the body-extract would emit a body-top `let <name> = <polyfill>`, but `let` + `var`/`function`
// on one name in a scope is a SyntaxError - so it must BAIL to the inline-default (no `let`) when
// the body already binds the name. `run` covers `var`, `make` the function-decl shape; `keep` is
// the no-over-bail control (its `var resolve` is in a NESTED scope, no collision, extract fires).
// immediately-invoked: every call site visible, so caller-lossy param emissions stay sound
(function run({ from, ...rest } = Array) {
  var from = 7;
  return [from, rest];
})();
(function make({ of: of_, x: a } = Array) {
  function of_() {}
  return [of_, a];
})();
(function keep({ resolve, ...rest } = Promise) {
  function inner() { var resolve = 1; return resolve; }
  return [resolve, rest, inner];
})();

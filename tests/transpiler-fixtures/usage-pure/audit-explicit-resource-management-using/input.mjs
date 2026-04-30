// `using` declaration - stage-4 explicit resource management. `createSyntaxRules.onVariableDeclaration`
// fires for kind === 'using' and injects symbol/dispose entry. babel-plugin's
// `createSyntaxVisitors` wires VariableDeclaration to the rule. covers the syntax-only
// dispatch path (no global identifier triggers symbol/dispose by itself)
function makeResource() {
  return {
    [Symbol.dispose]() { /* cleanup */ },
  };
}
function f() {
  using r = makeResource();
  return r;
}
export { f };

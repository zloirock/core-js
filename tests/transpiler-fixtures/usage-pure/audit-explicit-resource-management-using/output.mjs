import _Symbol$dispose from "@core-js/pure/actual/symbol/dispose";
// `using` declaration - stage-4 explicit resource management. A VariableDeclaration with
// kind === 'using' injects a symbol/dispose entry via the syntax-only dispatch path
// (no global identifier triggers symbol/dispose by itself).
function makeResource() {
  return {
    [_Symbol$dispose]() {/* cleanup */}
  };
}
function f() {
  using r = makeResource();
  return r;
}
export { f };
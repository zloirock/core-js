// the use sits INSIDE the loop body, AFTER the assignment, so on every iteration that reaches it `M`
// already holds the global - the assignment dominates and `M.Object.fromEntries` resolves. a loop
// re-runs `var M = globalThis` each iteration, which babel records as a declarator-self constant
// violation; that re-init is to the same fixed global, so it must NOT disqualify the alias (the
// unplugin var-hoist scan never counts declarators - this keeps them in parity)
function f() {
  while (c) {
    var M = globalThis;
    M.Object.fromEntries([['a', 1]]);
  }
}

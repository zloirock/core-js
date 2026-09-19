// var-shadow inside a for-loop body (BlockStatement scope owner per estree-toolkit, but
// var hoists to function scope in JS). collectScopeVars walks past ForStatement /
// BlockStatement / VariableDeclaration init slots and surfaces the var binding
const { Array: { from } } = globalThis, val = (function () {
  for (let i = 0; i < 1; i++) {
    var globalThis = 'loop-shadow';
  }
  return globalThis;
})();
console.log(from, val);

import _Array$from from "@core-js/pure/actual/array/from";
// var-shadow inside a for-loop body (BlockStatement scope owner per estree-toolkit, but
// var hoists to function scope in JS). collectScopeVars walks past ForStatement /
// BlockStatement / VariableDeclaration init slots and surfaces the var binding
const from = _Array$from;
const val = function () {
  for (let i = 0; i < 1; i++) {
    var globalThis = 'loop-shadow';
  }
  return globalThis;
}();
console.log(from, val);
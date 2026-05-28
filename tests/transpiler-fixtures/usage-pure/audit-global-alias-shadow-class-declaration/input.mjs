// outer `const { Promise } = globalThis` registers a globalAlias. inner `class Promise {}`
// shadow has ClassDeclaration shape (not VariableDeclarator), so the alias hint is
// rejected by the shape gate and `Promise.resolve(1)` stays bound to the local class
const { Promise } = globalThis;
function inner() {
  class Promise {
    static resolve(x) { return x; }
  }
  return Promise.resolve(1);
}
inner();
Promise.resolve(0);

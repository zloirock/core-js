import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// outer `const { Promise } = globalThis` registers a globalAlias. inner `class Promise {}`
// shadow has ClassDeclaration shape (not VariableDeclarator), so the alias hint is
// rejected by the shape gate and `Promise.resolve(1)` stays bound to the local class
const Promise = _Promise;
function inner() {
  class Promise {
    static resolve(x) {
      return x;
    }
  }
  return Promise.resolve(1);
}
inner();
_Promise$resolve(0);
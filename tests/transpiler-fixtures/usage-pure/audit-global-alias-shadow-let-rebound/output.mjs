import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// outer `const { Promise } = globalThis` registers an alias. inner `let Promise = ...`
// + later reassignment violates the const-binding assumption (`b.kind === 'let'` and
// constantViolations.length > 0). gate rejects both checks so the inner `Promise.resolve`
// resolves against the local mutable binding, not the polyfilled outer alias
const Promise = _Promise;
function inner() {
  let Promise = {
    resolve: x => x
  };
  Promise = {
    resolve: x => x + 1
  };
  return Promise.resolve(1);
}
inner();
_Promise$resolve(0);
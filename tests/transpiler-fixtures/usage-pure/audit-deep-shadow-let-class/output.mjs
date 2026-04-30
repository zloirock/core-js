import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// shadow check for `Promise` via deeply-nested let binding. inner reference resolves
// to the local user `Promise` class, not the global. plugin must not polyfill it.
function outer() {
  {
    {
      class Promise {}
      const x = new Promise();
      const y = x.at;
      return y;
    }
  }
}
// outer scope: `Promise` here is global - polyfilled
const z = _Promise$resolve(0);
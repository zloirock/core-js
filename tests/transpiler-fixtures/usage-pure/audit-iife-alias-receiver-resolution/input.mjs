// IIFE arg is a const-bound alias to a global: alias chain is followed back to the global
// so the rewrite fires for both the arrow form and the function form. distinct methods
// per line so the imports trace to their triggers
const proxyArr = Array;
(({ from }) => from([1, 2]))(proxyArr);
const proxyObj = Object;
(function ({ keys }) {
  return keys({ a: 1 });
})(proxyObj);

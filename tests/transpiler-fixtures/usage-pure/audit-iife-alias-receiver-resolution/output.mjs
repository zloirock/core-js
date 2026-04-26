import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
// IIFE arg is a const-bound alias to a global: alias chain is followed back to the global
// so the rewrite fires for both the arrow form and the function form. distinct methods
// per line so the imports trace to their triggers
const proxyArr = Array;
(({
  from
}) => from([1, 2]))({
  from: _Array$from
});
const proxyObj = Object;
(function ({
  keys = _Object$keys
}) {
  return keys({
    a: 1
  });
})(proxyObj);
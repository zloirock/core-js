import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
// IIFE arg references a const-bound alias to a global; resolver chases the alias to the
// real global so synth-swap (arrow form) and inline default (function form) both fire.
// distinct methods per line so the imports trace to their triggers
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
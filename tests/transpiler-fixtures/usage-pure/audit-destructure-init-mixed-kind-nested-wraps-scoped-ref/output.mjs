import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
(() => {
  var _ref2;
  return (() => {
    var _ref;
    if (Math.random() < 0) _atMaybeArray(_ref = [1]).call(_ref, 0);
    return 'inner';
  })(), _atMaybeArray(_ref2 = [2]).call(_ref2, 0);
})();
// outer arrow EXPRESSION body (kind=arrow) wraps a SE whose left side contains an inner
// bodyless `if (...) stmt` body-wrap (kind=stmt) with an instance polyfill registering a
// nested scopedVar. drainage returns ONE outermost wrap (the arrow's body SE) absorbing
// the inner stmt-wrap via recursive compose, which in turn absorbs the scopedVar at the
// converted block. pins kind=arrow + kind=stmt cohabiting in a single composed text
const from = _Array$from;
console.log(from);
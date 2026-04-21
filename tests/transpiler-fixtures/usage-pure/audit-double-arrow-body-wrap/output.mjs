import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// nested arrow expression bodies, each with an instance-method chain needing `_ref`
// memoization. `normalizeArrowRefParams` post-pass undoes `scope.push`'s param fallback
// — see `import-injector.js` for why in-visit block-convert races with sibling replaceWith
const g = x => (y => {
  var _ref;
  return _flatMaybeArray(_ref = _at(x).call(x, y)).call(_ref);
})(0);
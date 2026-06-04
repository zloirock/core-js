import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// usage-pure method call whose ARGUMENT is a depth-2 chain sharing the outer chain's receiver and
// first-method prefix (`x.flat().includes(x.flat().at(0))`): the same nth-recovery root as the
// sibling-branch case - the shared prefix must not be re-targeted across the two chains. regression lock
function f(x) {
  var _ref, _ref2;
  return _includes(_ref = _flatMaybeArray(x).call(x)).call(_ref, _at(_ref2 = _flatMaybeArray(x).call(x)).call(_ref2, 0));
}
f;
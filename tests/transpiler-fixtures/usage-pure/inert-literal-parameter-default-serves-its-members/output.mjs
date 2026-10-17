import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// Inert literal defaults retain the Iterator and Array family facts of their default paths. A supplied
// argument remains the actual receiver: pure body-entry dispatch preserves its own properties, while
// global usage injects the possible families without rewriting the parameter.
function h1({
  from: s1,
  name: nm1
} = {
  from: _Iterator$from,
  name: _nameMaybeFunction([_Iterator][0])
}) {
  return [s1, nm1];
}
function h2(_ref = [[1, 2]][0]) {
  let a2 = _at(_ref);
  return a2;
}
const h3 = ({
  concat: c3,
  name: nm3
} = {
  concat: _Iterator$concat,
  name: _nameMaybeFunction({
    I: _Iterator
  }.I)
}) => [c3, nm3];
use(h1, h2, h3);
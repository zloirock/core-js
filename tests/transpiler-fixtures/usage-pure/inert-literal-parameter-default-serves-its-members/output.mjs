import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// a parameter default spelled as an element of an INERT literal (`[Iterator][0]`, `[[1, 2]][0]`,
// `({ I: Iterator }).I`) serves the statics and instance members destructured off it, as the direct
// spelling does; a caller's own argument still destructures natively
function h1({
  from: s1,
  name: nm1
} = {
  from: _Iterator$from,
  name: _nameMaybeFunction([_Iterator][0])
}) {
  return [s1, nm1];
}
function h2({
  at: a2
} = {
  at: _atMaybeArray([[1, 2]][0])
}) {
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
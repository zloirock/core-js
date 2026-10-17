import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// The pure-read sequence prefix performs no work and is dropped when its receiver is replaced. The
// local truthy selector also decides the Array arm. `pure-read-prefix-stays-branch-local` keeps the
// prefixed receiver on a live branch under an undecided condition.
function withParamDefault({
  of
} = {
  of: _Array$of
}) {
  return of;
}
let cond = 1;
const from = _Array$from;
export { withParamDefault, from };
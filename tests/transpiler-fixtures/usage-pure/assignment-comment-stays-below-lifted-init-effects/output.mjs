import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
// The comments an assignment owns keep leading the first statement of its rewrite below the effects
// lifted out of its right, which run first, as for a declaration - beside a residual that survives and
// over a memo the rewrite plants. A comment inside each effect shows their order to the structural
// comparison too.
let from, of, rest, at, x;
log(/* lone */);
// owned by the assignment
from = _Array$from;
log(/* residual */);
// owned by an assignment whose residual survives
of = _Array$of;
({
  rest
} = Array);
// owned by an assignment whose receiver the rewrite memoizes
const _ref = holder.p;
at = _at(_ref);
({
  x
} = _ref);
use(from, of, rest, at, x);
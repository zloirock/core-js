import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// The comments an assignment owns keep leading the first statement of its rewrite below the effects
// lifted out of its right, which run first, as for a declaration - beside a residual that survives and
// over a memo the rewrite plants. A comment inside each effect shows their order to the structural
// comparison too.
let from, of, rest, at, x;
// owned by the assignment
({
  from
} = (log(/* lone */), Array));
// owned by an assignment whose residual survives
({
  of,
  rest
} = (log(/* residual */), Array));
// owned by an assignment whose receiver the rewrite memoizes
({
  at,
  x
} = holder.p);
use(from, of, rest, at, x);
import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// A conditional static branch stays beside its native neighbour under one array capture.
// The condition runs before either getter, including after destructuring lowering.
const [{
  native
}, {
  from
}] = [source, (effect(), pick) ? {
  from: _Array$from
} : other];
let beside, of;
[{
  beside
}, {
  of
}] = [second, (effect(), choose) ? {
  of: _Array$of
} : custom];
use(native, from, beside, of);
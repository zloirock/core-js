import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// an effectful computed key over a selection the build decides, behind an effect prefix: the selection
// reads as the operand that runs, so the key's route keeps the init - its prefix included - in the
// declarator, as for that operand spelled alone
const groupBy = (eff(), k(), _Map$groupBy);
let from = (eff(), k(), _Array$from);
export const withResolvers = (eff(), k(), _Promise$withResolvers);
const head = 1,
  of = (eff(), k(), _Array$of);
export { groupBy, from, head, of };
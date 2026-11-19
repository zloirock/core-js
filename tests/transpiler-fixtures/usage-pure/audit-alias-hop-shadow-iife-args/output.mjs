import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// the IIFE param-default receiver picks between the call-arg and the default, and the winner is
// resolved at ITS OWN site. distinct static per row so each arm attributes on its own

// a non-classifiable arg is not a usable receiver - the DEFAULT stays the source
export const viaUnknownArg = (({
  from
} = {
  from: _Array$from
}) => from)(someUnknown);

// an `undefined` arg makes the runtime apply the default - the default stays the source
export const viaUndefinedArg = (({
  of
} = {
  of: _Array$of
}) => of)(undefined);

// a side-effecting arg peels for classification while the effect stays in place, and the winning
// arg still resolves at the CALL site past an inner var of its own name
export const viaSeArg = (({
  groupBy
} = Array) => {
  var Object;
  return groupBy;
})((eff(), {
  groupBy: _Object$groupBy
}));
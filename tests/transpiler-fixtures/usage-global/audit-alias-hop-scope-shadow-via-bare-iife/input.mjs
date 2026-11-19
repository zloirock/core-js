// a no-default IIFE lifts the call-arg to the call site: the arg aliases a branching value and
// an inner var shadows the arg name, yet both arms resolve (`Object.groupBy` + `Map.groupBy`)
const groupBranch = globalThis.cond ? Object : Map;
const groupAlias = groupBranch;
export const viaBareIife = ((({ groupBy }) => {
  var groupAlias;
  return groupBy;
})(groupAlias));

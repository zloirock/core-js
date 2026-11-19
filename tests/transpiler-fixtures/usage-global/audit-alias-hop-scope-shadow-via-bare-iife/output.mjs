import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a no-default IIFE lifts the call-arg to the call site: the arg aliases a branching value and
// an inner var shadows the arg name, yet both arms resolve (`Object.groupBy` + `Map.groupBy`)
const groupBranch = globalThis.cond ? Object : Map;
const groupAlias = groupBranch;
export const viaBareIife = (({
  groupBy
}) => {
  var groupAlias;
  return groupBy;
})(groupAlias);
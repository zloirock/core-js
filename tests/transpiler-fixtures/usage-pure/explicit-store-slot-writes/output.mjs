import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Reflect$set from "@core-js/pure/actual/reflect/set";
// an explicit property store spelled on its namespace writes a container slot as an assignment does:
// a pattern read of the slot `Reflect.set` filled reaches its value
const bag = {
  b: Math
};
_Reflect$set(bag, 'b', Object);
const {
  b: viaSet
} = bag;
export const grouped = (viaSet === Object ? _Object$groupBy : viaSet.groupBy.bind(viaSet))(src, x => x);
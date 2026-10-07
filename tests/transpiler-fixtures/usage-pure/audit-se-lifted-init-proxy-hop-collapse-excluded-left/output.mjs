import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
// a lone-prop destructure whose init is lifted only for its side effect - no surviving sibling or rest
// reads the value - must not read an undefined `.self` hop off-browser (Node): where the `||` left
// decides nothing (`Map`, its constructor entry excluded, while `groupBy` keeps its own) the lifted statement
// keeps the fallback and spells the hop through its pure binding (`(fourthReads++, _self.Map) || _Set`)
let fourthReads = 0;
(fourthReads++, _self.Map) || _Set;
const mapGroupBy = _Map$groupBy;
export { mapGroupBy };
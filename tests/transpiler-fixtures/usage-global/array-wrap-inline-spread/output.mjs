import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an INLINE-array spread in a wrapper literal pairs by static position, so the static the slot
// holds is a claim: one module per row. the spread syntax itself keeps its iterator modules
const [{
  from
}] = [...[Array]];
const [, {
  fromEntries
}] = [...[0, Object]];
const [[{
  groupBy
}]] = [...[[...[Object]]]];
const [{
  hasOwn
}] = [...[c ? Object : userObj]];
const [{
  values
}] = [...[Object]];
export { from, fromEntries, groupBy, hasOwn, values };
import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.math.log10";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
import "core-js/modules/web.dom-collections.iterator";
// a slot the callee fills from a PARAMETER holds the argument THIS call passes: an object slot, one
// beside a literal slot, an array wrapper's element, a keyed slot under the wrapper. another call of
// the same callee passing Map (whose value owes its constructor entry) leaves the Object row with its
// own argument alone - no `groupBy` of Map rides on it. one static per row
const wrap = value => ({
  a: value
});
const {
  a: viaParam
} = wrap(Object);
export const fromParam = viaParam.groupBy([1], v => v);
const other = wrap(Map);
const pair = value => ({
  a: Object,
  b: value
});
const {
  a: viaLiteralBeside,
  b: viaParamBeside
} = pair(Math);
export const fromLiteralBeside = viaLiteralBeside.fromEntries([]);
export const fromParamBeside = viaParamBeside.log10(100);
const wrapArr = value => [value];
const [{
  raw: viaWrappedParam
}] = wrapArr(String);
export const fromWrappedParam = viaWrappedParam`x`;
const wrapKeyed = value => [{
  a: value
}];
const [{
  a: {
    of: viaWrappedKeyed
  }
}] = wrapKeyed(Array);
export const fromWrappedKeyed = viaWrappedKeyed(13);
import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a constructor written through a selection lands on every container its arms spell at any depth - an arm
// that is itself a selection or a logical fallback included - so a static read back through a nested arm owes
// the written constructor's family
const a = {
  C: Object
};
const b = {
  C: Object
};
const c = {
  C: Object
};
const picked = flag ? other ? b : c : a;
picked.C = Map;
export const grouped = b.C.groupBy([1], x => x);
const d = {
  C: Object
};
const e = {
  C: Object
};
const f = {
  C: Object
};
const chosen = flag ? d : other ? e : f;
chosen.C = Promise;
export const settled = f.C.allSettled([]);
const g = {
  C: Object
};
const h = {
  C: Object
};
const i = {
  C: Object
};
const fallen = flag ? g : h || i;
fallen.C = Symbol;
export const registered = i.C.for('a');
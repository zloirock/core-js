import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.set";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.url.constructor";
import "core-js/modules/web.url.can-parse";
import "core-js/modules/web.url.to-json";
import "core-js/modules/web.url-search-params.constructor";
import "core-js/modules/web.url-search-params.delete";
import "core-js/modules/web.url-search-params.has";
import "core-js/modules/web.url-search-params.size";
// an explicit store writes every chain its target lands on, as a member write does - an assignment's value,
// each arm of a selection, a sequence's tail, a slot of a literal spelled in place - so a static read back
// through the container owes the stored constructor's family
const first = {
  inner: {
    C: Object
  }
};
let held;
Object.assign(held = first.inner, {
  C: Map
});
export const grouped = first.inner.C.groupBy([1], x => x);
const second = {
  inner: {
    C: Object
  }
};
const other = {
  C: Object
};
Object.assign(flag ? second.inner : other, {
  C: Promise
});
export const settled = second.inner.C.allSettled([]);
const third = {
  inner: {
    C: Object
  }
};
Reflect.set((0, third.inner), 'C', Symbol);
export const registered = third.inner.C.for('a');
const fourth = {
  inner: {
    C: Object
  }
};
Object.defineProperty([fourth.inner][0], 'C', {
  value: URL
});
export const valid = fourth.inner.C.canParse('a:b');
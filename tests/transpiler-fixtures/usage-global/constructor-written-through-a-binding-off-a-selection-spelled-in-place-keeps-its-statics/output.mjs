import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
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
// a binding taken off a selection spelled in place, off a member of one, off a logical fallback or a sequence's
// tail stands for the path under each container it may yield, as one taken off a name holding it does - so a
// constructor written through it owes its family to a static read back through any of them
const first = {
  inner: {
    C: Object
  }
};
const second = {
  inner: {
    C: Object
  }
};
const {
  inner: viaPattern
} = flag ? first : second;
viaPattern.C = Map;
export const grouped = first.inner.C.groupBy([1], x => x);
const left = {
  inner: {
    C: Object
  }
};
const right = {
  inner: {
    C: Object
  }
};
const viaMember = (flag ? left : right).inner;
viaMember.C = Promise;
export const settled = left.inner.C.allSettled([]);
const tail = {
  inner: {
    C: Object
  }
};
const viaSequence = (log(), tail).inner;
viaSequence.C = Symbol;
export const registered = tail.inner.C.for('a');
const kept = {
  inner: {
    C: Object
  }
};
const spare = {
  inner: {
    C: Object
  }
};
const {
  inner: viaFallback
} = kept || spare;
viaFallback.C = URL;
export const valid = spare.inner.C.canParse('a:b');
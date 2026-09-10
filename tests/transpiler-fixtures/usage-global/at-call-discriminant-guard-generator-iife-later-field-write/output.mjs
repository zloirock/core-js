import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
// the discriminant lane bounds a use inside an immediately invoked body at the call's end - the body
// ran there, so a field write after the call cannot reach it. a generator body did NOT run at the
// call and an async body suspends: their reads see the writes below, so the narrow drops. the
// generator row then injects both reachable families; the async row injects a third the declared
// union cannot reach - a member read off `A | B` is not distributed (the same read off
// `{ v: string | number[] }` stops at two)
type A = {
  kind: 'a';
  v: string;
};
type B = {
  kind: 'b';
  v: number[];
};
export function viaGenerator(o: A | B) {
  if (o.kind === 'a') {
    const it = function* () {
      yield o.v.at(0);
    }();
    o.kind = 'b';
    o.v = [1, 2];
    return it;
  }
  return null;
}
export function viaAsync(o: A | B) {
  if (o.kind === 'a') {
    const p = (async () => {
      await 0;
      return o.v.includes('x');
    })();
    o.kind = 'b';
    o.v = [1, 2];
    return p;
  }
  return null;
}
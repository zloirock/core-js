import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A parameter decorator's argument is walked apart from the main traversal, and a function inside it
// destructures as one anywhere else does: a declaration, an assignment, a default, a nested level, a nested
// function, an array wrapper declared and assigned, and a constructor rest each take the polyfill of the
// method or static they read, once.
const list = [1, 2];
export class Service {
  constructor(@Inject(() => {
    const {
      includes
    } = list;
    return includes;
  })
  a: unknown, @Inject(() => {
    let trunc;
    ({
      trunc
    } = Math);
    return trunc;
  })
  b: unknown, @Inject(() => {
    const {
      of = null
    } = Array;
    return of;
  })
  c: unknown, @Inject(() => {
    const {
      k: {
        flat
      }
    } = {
      k: [1, [2]]
    };
    return flat;
  })
  d: unknown, @Inject(() => function () {
    const {
      at
    } = list;
    return at;
  })
  e: unknown, @Inject(() => {
    const [{
      findLast
    }] = [[3, 4]];
    return findLast;
  })
  f: unknown, @Inject(() => {
    let last;
    [{
      findLastIndex: last
    }] = [[5, 6]];
    return last;
  })
  g: unknown, @Inject(() => {
    const {
      groupBy,
      ...rest
    } = Map;
    return [groupBy, rest];
  })
  h: unknown) {}
}
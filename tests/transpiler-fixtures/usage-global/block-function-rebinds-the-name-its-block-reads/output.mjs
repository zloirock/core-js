import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a function a block declares binds its name in that block, and the cases of a switch share one block,
// so a presence test or a written value reading that name inside reads the local binding, not the
// global: the test decides nothing, and the write stores the local value
export function element() {
  const list = [[1]];
  {
    function Reflect() {}
    if (typeof Reflect == 'object') list[0] = 'abc';
    return list[0].includes(1);
  }
}
export function settled(items) {
  let C = Array;
  {
    function Reflect() {}
    if (typeof Reflect == 'object') C = Map;
    return C.from(items);
  }
}
export function sibling(kind) {
  const list = [[1]];
  switch (kind) {
    case 1:
      let Reflect = 1;
      break;
    case 2:
      if (typeof Reflect == 'object') list[0] = 'abc';
      return list[0].at(0);
  }
}
export function written(tasks) {
  let C = Set;
  {
    function Promise() {}
    Promise.allSettled = list => list;
    C = Promise;
  }
  return C.allSettled(tasks);
}
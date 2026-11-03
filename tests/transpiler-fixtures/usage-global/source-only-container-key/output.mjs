import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.push";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A computed key may query a source-only container before its later write.
// The native default reads a static from the substituted constructor.
const arr = [];
const k = String(arr.length);
const {
  [k]: {
    groupBy
  } = Map
} = {};
arr.push(groupBy);
export const r = typeof arr[0];
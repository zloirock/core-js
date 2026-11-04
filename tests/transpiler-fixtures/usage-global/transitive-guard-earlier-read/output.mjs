import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An earlier unrelated read must leave the Promise alias as certain as when resolve is read first.
// Global mode keeps the native calls and supplies their dependencies.
let a = Array,
  b = Map,
  c = Promise;
if (!b) if (!c) a = OtherArray;
if (!a) b = OtherMap;
if (!b) c = Service;
export const unused = a.unrelated;
export const value = c.resolve(1);
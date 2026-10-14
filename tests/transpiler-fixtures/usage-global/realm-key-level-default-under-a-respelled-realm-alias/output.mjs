import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// A realm alias names the realm, whichever binding reaches it (`realm`, `host = self`): the build serves the
// key's constructor, so the level's default is dead text and, like the dead part of a decided selection, no
// usage - no module for either level's default (`Set`, `WeakSet`).
const realm = globalThis;
const {
  Map: {
    groupBy
  } = Set
} = realm;
const host = self;
const {
  Promise: {
    allSettled
  } = WeakSet
} = host;
export { groupBy, allSettled };
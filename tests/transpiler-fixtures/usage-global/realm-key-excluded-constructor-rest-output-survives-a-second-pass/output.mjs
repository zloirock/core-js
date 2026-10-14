import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// the pure method's output re-fed to the plugin, as a library published pre-polyfilled against @core-js/pure
// ships it: for a constructor the build is told not to inject, a rest hop keeps a sentinel in each claimed
// leaf's place beside the static's own extraction. the sentinel is our own spelling, beside a live leaf as much
// as alone, so a second pass extracts nothing again and leaves every line as it is
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
const groupBy = _Map$groupBy;
const Kept = _Set;
const {
  Map: {
    groupBy: _unused,
    ...grouped
  } = _Set
} = _globalThis;
const any = _Promise$any;
const {
  Promise: {
    any: _unused2,
    prototype: {
      catch: rescue
    },
    ...pooled
  } = _Set
} = _self;
const attempt = _Promise$try;
const {
  Promise: {
    try: _unused3,
    prototype: {
      then
    },
    ...tried
  }
} = _globalThis;
export { groupBy, grouped, Kept, any, rescue, pooled, attempt, then, tried };
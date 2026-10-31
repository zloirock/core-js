import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a closure returning an alias of a class member hands the member's constructor on, so a static
// read off a slot holding the closure's call is served by that static's own entry - through a
// static field and a static getter alike
class Fields {
  static P = Promise;
}
class Getters {
  static get M() {
    return Map;
  }
}
const field = Fields.P;
const got = Getters.M;
const viaField = () => field;
const viaGetter = () => got;
const list = [viaField()];
export const attempted = typeof list[0].try;
export const grouped = typeof [viaGetter()][0].groupBy;
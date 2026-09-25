import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a closure returning an alias of a class member hands the member's constructor on, so a static
// read off a slot holding the closure's call is served by that static's own entry - through a
// static field and a static getter alike
class Fields {
  static P = _Promise;
}
class Getters {
  static get M() {
    return _Map;
  }
}
const field = Fields.P;
const got = Getters.M;
const viaField = () => field;
const viaGetter = () => got;
const list = [viaField()];
export const attempted = typeof _Promise$try;
export const grouped = typeof (viaGetter(), _Map$groupBy);
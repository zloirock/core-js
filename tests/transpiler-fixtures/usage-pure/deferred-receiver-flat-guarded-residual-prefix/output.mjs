import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
var _ref;
// The flat guarded residual keeps its prefix and receiver read together, once.
export let r;
export const effects = [];
function record(value) {
  effects[effects.length] = value;
}
class Box {
  static get value() {
    record('get');
    return _globalThis;
  }
}
const {
  other
} = (record('prefix'), _ref = Box.value, _ref === _globalThis ? _Map : _ref.Map);
const groupBy = _Map$groupBy;
r = [typeof groupBy, typeof other];
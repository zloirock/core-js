import _Array$from from "@core-js/pure/actual/array/from";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
var _ref;
// Static reads inside instance-call arguments retain their constructor and effects.
const effects = [];
let r;
const o = {
  make() {
    _pushMaybeArray(effects).call(effects, "callee");
    return Array;
  }
};
r = _mapMaybeArray(_ref = [3, 4]).call(_ref, x => (o.make(), _Array$from)([x]));
export { r, effects };
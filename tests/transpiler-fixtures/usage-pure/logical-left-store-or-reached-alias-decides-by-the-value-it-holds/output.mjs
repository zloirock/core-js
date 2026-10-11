import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// A `||` left decides by the value it holds where the slot is read. A store yields the value it stores:
// the mirror keeps the store running ahead of the literal. A name a conditional write may null holds no
// one container: the right stays live, and the guard reads the captured slot.
var stored;
function make() {
  return {
    C: Array
  };
}
export const {
  C: {
    from: viaStore
  }
} = (stored = make(), {
  C: {
    from: _Array$from
  }
});
let held = {
  C: _Map
};
if (_globalThis.flag) held = null;
const {
    C: _ref
  } = held || {
    C: Object
  },
  viaReachedAlias = _ref === Object ? _Object$groupBy : _ref.groupBy;
export { viaReachedAlias };
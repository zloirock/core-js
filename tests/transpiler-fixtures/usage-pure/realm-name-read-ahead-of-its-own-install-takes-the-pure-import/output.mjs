import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
import _Map from "@core-js/pure/actual/map";
import _self from "@core-js/pure/actual/self";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
var _ref;
// the realm NAME `globalThis` read ahead of its own install (`window.globalThis = window`) is the realm this build
// serves - as a key off another realm, under an operator, as an arm of a selection or as a destructured level - so
// each spelling reads like its install-free twin
export const keyIn = _isIterable(obj);
export const keyRead = obj[_Symbol$asyncIterator];
export const deleted = delete _self.customSlot;
export const selectedHop = _Array$from(list);
export const selectedArm = (_ref = c ? _globalThis : user, _ref === _globalThis ? _Map : _ref.Map).groupBy;
const of = _Array$of;
const {
  globalThis: {
    Array: _unused,
    ...rest
  }
} = _self;
export const {
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
};
export { of, rest };
window.globalThis = window;
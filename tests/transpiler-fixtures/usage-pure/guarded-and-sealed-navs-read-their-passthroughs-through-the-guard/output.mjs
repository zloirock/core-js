import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _self from "@core-js/pure/actual/self";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A guarded or sealed nav keeps its probe where a slot reads past it: plain hops above a `?.`, a computed
// optional hop keyed by a literal or a sequence, a computed boundary member after a seal, a symbol slot
// past a guarded realm and a defaulted static under a store of a realm `&&`. A plain probe in parentheses
// guards nothing and folds.
export function f({
  of,
  other
} = function (_ref) {
  return null == _ref ? _ref : {
    of: _Array$of,
    get other() {
      return _ref.other;
    }
  };
}(null == _globalThis.window ? void 0 : _self.Array)) {
  return [of, other];
}
export function g({
  from,
  other
} = function (_ref2) {
  return null == _ref2 ? _ref2 : {
    from: _Array$from,
    get other() {
      return _ref2.other;
    }
  };
}(_globalThis.window?.['Array'])) {
  return [from, other];
}
export function h({
  trunc,
  other
} = function (_ref3) {
  return null == _ref3 ? _ref3 : {
    trunc: _Math$trunc,
    get other() {
      return _ref3.other;
    }
  };
}(_globalThis.window?.[0, 'Math'])) {
  return [trunc, other];
}
const fromAsync = _Array$fromAsync;
const groupBy = ((null == _globalThis.window ? void 0 : _self)["Map"], _Map$groupBy);
const n = ((null == _globalThis.window ? void 0 : _self)[_Symbol$iterator], _nameMaybeFunction(_getIteratorMethod(_self)));
let stored;
const {
  Promise: {}
} = stored = flag && _globalThis;
const any = _Promise$any;
export { fromAsync, groupBy, n, any };
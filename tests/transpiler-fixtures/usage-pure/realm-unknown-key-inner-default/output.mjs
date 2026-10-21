import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Math$sumPrecise from "@core-js/pure/actual/math/sum-precise";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _String$raw from "@core-js/pure/actual/string/raw";
var _ref, _ref2;
// Unknown realm slots keep live defaults and their own reads. Instance dispatch folds both
// the slot and its fallback; static defaults keep their mirrors. A known global makes its default dead.
function use() {/* empty */}
const {
  Deno: {
    env
  } = {}
} = _globalThis;
const {
  UserMaps: {
    groupBy
  } = {
    groupBy: _Map$groupBy
  }
} = _globalThis;
let fromAsync;
({
  UserArrays: {
    fromAsync
  } = {
    fromAsync: _Array$fromAsync
  }
} = _globalThis);
for (const {
  UserPromises: {
    allSettled
  } = {
    allSettled: _Promise$allSettled
  }
} of [_globalThis]) use(allSettled);
const [{
  UserObjects: {
    fromEntries
  } = Object
}] = [_globalThis];
const key = 'UserStrings';
const {
  [key]: {
    raw
  } = {
    raw: _String$raw
  }
} = _globalThis;
const {
  UserNumbers: {
    isInteger
  } = {
    isInteger: _Number$isInteger
  }
} = _globalThis;
const realm = _globalThis;
const {
  UserOwners: {
    hasOwn
  } = {
    hasOwn: _Object$hasOwn
  }
} = realm;
const {
  userLists: {
    of
  } = {
    of: _Array$of
  }
} = _globalThis;
const at = _at((_ref = _globalThis.userRanges) === void 0 ? [1, 2] : _ref);
const [,] = [_globalThis];
const includes = _includes((_ref2 = _globalThis.userFinders) === void 0 ? [1, 2] : _ref2);
const {
  Math: {
    sumPrecise
  }
} = {
  Math: {
    sumPrecise: _Math$sumPrecise
  }
};
use(env, groupBy, fromAsync, fromEntries, raw, isInteger, hasOwn, of, at, includes, sumPrecise);
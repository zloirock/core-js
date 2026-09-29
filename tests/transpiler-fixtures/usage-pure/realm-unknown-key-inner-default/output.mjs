import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Math$sumPrecise from "@core-js/pure/actual/math/sum-precise";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _String$raw from "@core-js/pure/actual/string/raw";
// a realm key that names no built-in is an unknown slot, capitalised or not: its inner default runs
// wherever the realm leaves the slot empty, so the default is mirrored and the slot keeps its own
// read - on every host below alike. the last row is the control: a known built-in is the realm's
// own slot, whose default never runs
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
  } = {
    fromEntries: _Object$fromEntries
  }
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
const {
  userRanges: {
    at
  } = {
    at: _atMaybeArray([1, 2])
  }
} = _globalThis;
const [{
  self: {
    userFinders: {
      includes
    } = {
      includes: _includesMaybeArray([1, 2])
    }
  }
}] = [_globalThis];
const {
  Math: {
    sumPrecise
  } = {}
} = {
  Math: {
    sumPrecise: _Math$sumPrecise
  }
};
use(env, groupBy, fromAsync, fromEntries, raw, isInteger, hasOwn, of, at, includes, sumPrecise);
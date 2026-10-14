import _AggregateError from "@core-js/pure/actual/aggregate-error";
import _Array$from from "@core-js/pure/actual/array/from";
import _DOMException from "@core-js/pure/actual/dom-exception";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Promise$reject from "@core-js/pure/actual/promise/reject";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
import _Symbol from "@core-js/pure/actual/symbol";
import _URL from "@core-js/pure/actual/url";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
var _ref, _unused7;
// A static is decided by its own entry, never by its constructor's: excluding a constructor only stops injecting
// it, so a static read off the realm under its key takes its polyfill whatever default stands on the level, bound
// beside the rest the realm's own read keeps - whatever spells the realm, beside a nested level, a claimed sibling
// or an export, and in an assignment. Without the default the same, as for a constructor a realm always carries.
const groupBy = _Map$groupBy;
const {
  Map: {
    groupBy: _unused,
    ...grouped
  } = _WeakSet
} = _globalThis;
const realm = _globalThis;
const attempt = _Promise$try;
const {
  Promise: {
    try: _unused2,
    ...tried
  } = _WeakMap
} = realm;
const allSettled = _Promise$allSettled;
const {
  Promise: {
    allSettled: _unused3,
    ...settled
  } = _DOMException
} = _self;
const any = _Promise$any;
const {
  Promise: {
    any: _unused4,
    prototype: {
      then
    },
    ...anyRest
  } = _Reflect
} = _globalThis;
export const race = _Promise$race;
const {
  Promise: {
    race: _unused5,
    ...raced
  } = _Symbol
} = _globalThis;
export { raced };
const reject = _Promise$reject;
const S = _Set;
const {
  Promise: {
    reject: _unused6,
    ...rejected
  } = _Iterator
} = _globalThis;
let resolve, resolved;
({
  Promise: _ref = _URL
} = _globalThis), resolve = _Promise$resolve, {
  resolve: _unused7,
  ...resolved
} = _ref;
const withResolvers = _Promise$withResolvers;
const {
  Promise: {
    withResolvers: _unused8,
    ...pending
  }
} = _globalThis;
const from = _Array$from;
const {
  Array: {
    from: _unused9,
    ...arrays
  } = _AggregateError
} = _globalThis;
use(groupBy, grouped, attempt, tried, allSettled, settled, any, then, anyRest, reject, rejected, S, resolve, resolved);
use(withResolvers, pending, from, arrays);
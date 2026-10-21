import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$all from "@core-js/pure/actual/promise/all";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Promise$reject from "@core-js/pure/actual/promise/reject";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
import _Symbol from "@core-js/pure/actual/symbol";
var _ref, _unused9;
// A realm key whose constructor entry the build excludes has no whole index for the rest under it to
// take: its claimed statics extract as off a constructor-less key and the rest keeps the realm's own,
// whatever spells the realm - itself, `self`, an alias, behind an effect - beside a nested level, a
// claimed sibling or an export. An assignment binds its static through the level's ordered capture.
const attempt = _Promise$try;
const {
  Promise: {
    try: _unused,
    ...tried
  }
} = _globalThis;
const allSettled = _Promise$allSettled;
const {
  Promise: {
    allSettled: _unused2,
    ...settled
  }
} = _self;
const realm = _globalThis;
const any = _Promise$any;
const {
  Promise: {
    any: _unused3,
    ...anyRest
  }
} = realm;
const race = _Promise$race;
const {
  Promise: {
    race: _unused4,
    prototype: {
      then
    },
    ...raced
  }
} = _globalThis;
export const withResolvers = _Promise$withResolvers;
const {
  Promise: {
    withResolvers: _unused5,
    ...resolvers
  }
} = _globalThis;
export { resolvers };
log();
const reject = _Promise$reject;
const {
  Promise: {
    reject: _unused6,
    ...rejected
  }
} = _globalThis;
const S = _Set;
const groupBy = _Map$groupBy;
const {
  Map: {
    groupBy: _unused7,
    ...grouped
  }
} = _globalThis;
const resolve = _Promise$resolve;
const Sym = _Symbol;
const {
  Promise: {
    resolve: _unused8,
    ...resolved
  }
} = _globalThis;
let all, allRest;
({
  Promise: _ref
} = _globalThis);
all = _Promise$all, {
  all: _unused9,
  ...allRest
} = _ref;
use(attempt, tried, allSettled, settled, any, anyRest, race, then, raced, reject, rejected, S, groupBy, grouped, resolve, resolved, Sym, all, allRest);
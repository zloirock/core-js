import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Promise$reject from "@core-js/pure/actual/promise/reject";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _Set from "@core-js/pure/actual/set";
import _URL from "@core-js/pure/actual/url/constructor";
// A static is decided by its own entry, never by its constructor's: excluding a constructor only stops injecting
// it - the data subset still carries it - so a static read off the realm under its key takes its polyfill and the
// mirror fills the slot with it, the level's dead default leaving, whatever spells the realm, in an assignment and
// beside a claimed sibling; a key with no static of its own reads the realm's slot raw (`of`). Under a parameter's
// default the level's own default stays live, a caller's object standing in for the realm.
const {
  Map: {
    groupBy
  }
} = {
  Map: {
    groupBy: _Map$groupBy
  }
};
const {
  Promise: {
    try: attempt
  }
} = {
  Promise: {
    try: _Promise$try
  }
};
const {
  Promise: {
    allSettled,
    prototype: {
      then
    }
  }
} = {
  Promise: {
    allSettled: _Promise$allSettled,
    prototype: _globalThis.Promise.prototype
  }
};
let any;
({
  Promise: {
    any
  }
} = {
  Promise: {
    any: _Promise$any
  }
});
const {
  Promise: {
    race
  },
  Set: S
} = {
  Promise: {
    race: _Promise$race
  },
  Set: _Set
};
const {
  Promise: {
    withResolvers,
    of
  }
} = {
  Promise: {
    withResolvers: _Promise$withResolvers,
    of: _globalThis.Promise.of
  }
};
export function read({
  Promise: {
    reject
  } = _URL
} = {
  Promise: {
    reject: _Promise$reject
  }
}) {
  return reject;
}
export { groupBy, attempt, allSettled, then, any, race, S, withResolvers, of };
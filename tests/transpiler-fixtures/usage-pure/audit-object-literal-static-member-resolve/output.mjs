import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// an object literal is a name-indexable static container: a nested destructure off one of its keys
// resolves the LAST matching member's value, through the same canonical resolver a class body uses

// a computed static-string key overrides an earlier plain key (last-wins sees through it)
const withComputed = {
  N: Array,
  ["N"]: _Promise
};
const allSettled = _Promise$allSettled;
export const viaComputed = allSettled([]);

// an unresolvable computed key could BE the target at runtime -> bail (native)
export function dynamicBails(o) {
  const ns = {
    P: Array,
    [o.k]: _Iterator
  };
  const {
    P: {
      from
    }
  } = ns;
  return from([1, 2]);
}

// a trailing spread could redefine the key -> bail (native)
export function spreadBails(extra) {
  const ns = {
    Q: _Map,
    ...extra
  };
  const {
    Q: {
      groupBy
    }
  } = ns;
  return groupBy([], x => x);
}

// a getter winning the key is a dynamic value -> bail (native)
export function accessorBails() {
  const ns = {
    get R() {
      return _Set;
    }
  };
  const {
    R: {
      union
    }
  } = ns;
  return union;
}

// a clean plain key folds normally (control)
const clean = {
  S: _Iterator
};
const from = _Iterator$from;
export const viaClean = from([3, 4]);
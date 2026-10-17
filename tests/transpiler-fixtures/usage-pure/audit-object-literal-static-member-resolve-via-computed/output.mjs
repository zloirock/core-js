import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// A named object-literal slot resolves its last matching value.
// Unknown computed keys and trailing spreads require a constructor identity check;
// replacement values retain their own member, and accessors remain unresolved.
// Constructors used by unresolved reads must carry their static methods.

// a computed static-string key overrides an earlier plain key (last-wins sees through it)
const withComputed = {
  N: Array,
  ["N"]: _Promise
};
const {
  N: {
    allSettled
  }
} = {
  N: {
    allSettled: _Promise$allSettled
  }
};
export const viaComputed = allSettled([]);
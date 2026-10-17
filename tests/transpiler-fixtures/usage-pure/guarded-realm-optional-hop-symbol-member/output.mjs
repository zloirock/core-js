import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol from "@core-js/pure/actual/symbol";
// A guarded realm alias read through an OPTIONAL hop the chain CONTINUES past spells the short-circuit ONCE over the whole
// continuation: the member-level conditional cannot carry the `?.` to the hops above it, so the guard hoists and the raw branch is
// spelled plain.
export function symbolMember(flag) {
  if (flag) {
    var realm = _globalThis;
  }
  return null == realm ? void 0 : (realm === _globalThis ? _Symbol : realm.Symbol).iterator;
}
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// multi-generic: only T is bound via rest (from 'a'/'b'/'c'); U has no param annotation to
// seed from, stays unresolved — rest-branch must not mis-bind U while resolving T
function fn<T, U>(...xs: T[]): T {
  return xs[0];
}
const s = fn('a', 'b', 'c');
_atMaybeString(s).call(s, 0);
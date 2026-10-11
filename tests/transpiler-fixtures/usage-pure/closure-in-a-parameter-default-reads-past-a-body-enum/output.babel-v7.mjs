import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a closure written in a parameter list runs in that list's environment, so an enum the function's body
// declares does not shadow a name it reads: the closure reads the global or the outer binding
export function grouped(p = () => _Map$groupBy(xs, f)) {
  enum Map {
    x,
  }
  return [p, Map];
}
const s = 'abc';
export function last(q = () => _atMaybeString(s).call(s, -1)) {
  enum s {
    y,
  }
  return [q, s];
}
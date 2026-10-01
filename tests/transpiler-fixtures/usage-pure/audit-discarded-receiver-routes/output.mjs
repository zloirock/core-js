import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$entries from "@core-js/pure/actual/object/entries";
// Receiver prefixes retain live polyfill rewrites under bodyless and assignment hosts.
// Each observable call runs once at its original evaluation point.
const arr = [1, [2]];
function mk() {
  return _globalThis;
}
export function bodylessLiftedPrefix() {
  if (1) var {
    Map: {
      groupBy
    }
  } = (_flatMaybeArray(arr).call(arr), {
    Map: {
      groupBy: _Map$groupBy
    }
  });
  return typeof groupBy;
}
export function bodylessLiftedPrefixWhile() {
  do var {
    Object: {
      entries
    }
  } = (_flatMaybeArray(arr).call(arr), {
    Object: {
      entries: _Object$entries
    }
  }); while (0);
  return typeof entries;
}
export function assignOverQuietCallRoot() {
  let of;
  of = _Array$of;
  return typeof of;
}
export function assignOverEffectfulCallRoot() {
  let from;
  from = _Array$from;
  return typeof from;
}
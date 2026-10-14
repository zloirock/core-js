import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A static the build excludes is a method the constructor's ponyfill lacks: every spelling reads it off that
// ponyfill, as on an engine without the method - a member read, a realm member, an alias, a destructure, a realm
// level and a mirrored one, an `in` test, a decided guard and a parameter default. The statics the build serves
// beside them still extract.
export const direct = _Promise.try(task);
export const viaRealm = _Promise.withResolvers();
const P = _Promise;
export const viaAlias = _Promise.allSettled(list);
const {
  any
} = P;
const {
  race
} = _Promise;
const {
  groupBy
} = _Map;
const {
  Iterator: {
    concat
  },
  Array: {
    from
  }
} = {
  Iterator: _Iterator,
  Array: {
    from: _Array$from
  }
};
export const tested = 'reject' in _Promise;
export const guarded = _Promise.all;
export function keyed({
  allKeyed,
  resolve
} = {
  allKeyed: _Promise.allKeyed,
  resolve: _Promise$resolve
}) {
  return [allKeyed, resolve];
}
export { any, race, groupBy, concat, from };
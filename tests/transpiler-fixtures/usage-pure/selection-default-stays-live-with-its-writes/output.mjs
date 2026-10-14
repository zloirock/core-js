import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
// A default over a SELECTION of receivers stays live, however the build serves one arm's static: another arm may
// lack it, so the default runs there and its writes reach the reads below.
export function selected(flag) {
  let list = [3, 4];
  const {
    from = list = 'ab'
  } = flag ? {
    from: _Array$from
  } : _Set;
  return [from, _at(list).call(list, -1)];
}
export function guarded(flag) {
  let list = [3, 4];
  const {
    groupBy = list = 'ab'
  } = flag && {
    groupBy: _Map$groupBy
  };
  return [groupBy, _at(list).call(list, -1)];
}
export function either(source) {
  let list = [3, 4];
  const {
    from = list = 'ab'
  } = source || {
    from: _Array$from
  };
  return [from, _at(list).call(list, -1)];
}
export function assigned(flag) {
  let list = [3, 4];
  let from;
  ({
    from = list = 'ab'
  } = flag ? {
    from: _Array$from
  } : _Set);
  return [from, _at(list).call(list, -1)];
}
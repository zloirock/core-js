import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a for-of head keeping a rest beside a static reads the static off the element; the rest is a copy
// of the element's own enumerable keys, so a static read off it stays raw and an `in` probe on it is
// no probe of the constructor - even where the head is relocated and its declarator re-spelled
const on = [1].length > 0;
for (const _ref of [Array]) {
  let _ref2 = _ref,
    from = _Array$from,
    {
      from: _unused,
      ...rest
    } = _ref2;
  console.log(from([1]), rest.of, 'isArray' in rest);
}
for (const _ref3 of [on ? _Map : _Map]) {
  let groupBy = _Map$groupBy;
  let {
    groupBy: _unused2,
    ...others
  } = _ref3;
  console.log(groupBy, others.groupBy);
}
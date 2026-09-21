import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Promise from "@core-js/pure/actual/promise";
// Constructor defaults with rest use the full index; supplied objects keep their properties.
// Other static extractions require closed callers; key/default effects remain independent.

const tagRead = function ({
  from: From,
  ...rest
} = Array, x = <From />) {
  return [From, x, rest];
}();
const memberRootRead = function ({
  of: Of,
  ...rest
} = Array, x = <Of.Sub />) {
  return [Of, x, rest];
}();
const intrinsicTag = function ({
  race,
  ...rest
} = _Promise, x = <race />) {
  return [race, x, rest];
}();
const attributeName = function ({
  hasOwn: _unused,
  ...rest
} = Object, x = <div H={1} />) {
  let H = _Object$hasOwn;
  return [H, x, rest];
}();
const classMethodKey = function ({
  fromEntries: _unused2,
  ...rest
} = Object, x = class {
  fromEntries() {}
}) {
  let fromEntries = _Object$fromEntries;
  return [fromEntries, x, rest];
}();
const classFieldKey = function ({
  groupBy: _unused3,
  ...rest
} = Object, x = class {
  groupBy = 1;
}) {
  let groupBy = _Object$groupBy;
  return [groupBy, x, rest];
}();
export { tagRead, memberRootRead, intrinsicTag, attributeName, classMethodKey, classFieldKey };
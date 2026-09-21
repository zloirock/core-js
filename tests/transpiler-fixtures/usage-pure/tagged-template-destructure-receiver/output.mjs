import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// A tagged template is a call of its tag, so a destructure whose RECEIVER is one names what the tag
// hands back the way a call's receiver does - the tag still runs ahead of the extraction. Each host
// reads a different static, because a shared one would let a single injection mask the others.
function tagArray() {
  return Array;
}
function tagMap() {
  return _Map;
}
function wrap(strings, value) {
  return value;
}
tagArray`x`;
const from = _Array$from;
const {
  w: {
    groupBy
  }
} = {
  w: (tagMap`y`, {
    groupBy: _Map$groupBy
  })
};
const [{
  withResolvers
}] = [(wrap`z${_Promise}`, {
  withResolvers: _Promise$withResolvers
})];
export const flat = from([1]);
export const nested = groupBy([2], x => x);
export const wrapped = withResolvers();
import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// A direct tag-returned constructor supports static extraction.
// Constructor values inside literal wrappers keep full entries and native property reads.
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
  w: tagMap`y`
};
const [{
  withResolvers
}] = [wrap`z${_Promise}`];
export const flat = from([1]);
export const nested = groupBy([2], x => x);
export const wrapped = withResolvers();
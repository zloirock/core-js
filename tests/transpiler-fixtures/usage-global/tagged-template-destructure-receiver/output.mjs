import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A tagged template is a call of its tag, so a destructure whose RECEIVER is one names what the tag
// hands back the way a call's receiver does - the tag still runs ahead of the extraction. Each host
// reads a different static, because a shared one would let a single injection mask the others.
function tagArray() {
  return Array;
}
function tagMap() {
  return Map;
}
function wrap(strings, value) {
  return value;
}
const {
  from
} = tagArray`x`;
const {
  w: {
    groupBy
  }
} = {
  w: tagMap`y`
};
const [{
  withResolvers
}] = [wrap`z${Promise}`];
export const flat = from([1]);
export const nested = groupBy([2], x => x);
export const wrapped = withResolvers();
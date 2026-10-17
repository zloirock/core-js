import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the SHADOW itself is reassigned locally - a mutation of the inner binding cannot reach the
// outer hop the alias actually captured
const outerRoot = Promise;
const outerLink = outerRoot;
export function viaShadowReassignedLocally(outerRoot) {
  outerRoot = {};
  const {
    allSettled
  } = outerLink;
  return allSettled([]);
}
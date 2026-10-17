import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// labeled block
const labelRoot = Promise;
const labelLink = labelRoot;
export function viaLabeledShadow() {
  tail: {
    const labelRoot = {};
    const {
      allSettled
    } = labelLink;
    return allSettled([]);
  }
}
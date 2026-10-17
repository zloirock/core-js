import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
// a `var` declared in a NESTED function does not reach the outer use at all
const nestedRoot = Promise;
export function viaNestedFnVar() {
  function inner() {
    var nestedHeld = nestedRoot;
    return nestedHeld;
  }
  {
    const {
      race
    } = nestedHeld;
    return race([]);
  }
}
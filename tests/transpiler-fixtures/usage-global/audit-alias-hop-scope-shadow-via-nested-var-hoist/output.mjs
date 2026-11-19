import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a function-scoped `var` declared in a NESTED block hoists to its function scope: the alias it
// holds must resolve where the var lives, not at the use site - an unrelated block there may
// shadow the hop name (the parsers disagreed here: one hoists natively, the other synthesizes
// the hoisted binding, and both must report the same declaration scope)
const seedRoot = Promise;
const seedLink = seedRoot;
export function viaNestedVarHoist() {
  {
    var held = seedLink;
  }
  {
    const seedLink = {};
    const {
      allSettled
    } = held;
    return allSettled([]);
  }
}
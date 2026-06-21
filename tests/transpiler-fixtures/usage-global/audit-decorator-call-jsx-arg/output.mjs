import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.function.metadata";
import "core-js/modules/esnext.symbol.metadata";
import "core-js/modules/web.dom-collections.iterator";
// Decorator-call shape (`@wrap(<Map />)`) - decorator IS a CallExpression whose argument
// is a JSX element. the JSX tag-name (`Map`) inside the call arg must still be scanned for
// global polyfill detection. distinct decorator factories per class pin emission per global:
// `wrap(<Map/>)` vs `wrap(<Promise/>)` makes the JSX-arg path fire twice independently.
function wrap(component) {
  return () => {};
}
@wrap(<Map />)
class WithMap {}
@wrap(<Promise />)
class WithPromise {}
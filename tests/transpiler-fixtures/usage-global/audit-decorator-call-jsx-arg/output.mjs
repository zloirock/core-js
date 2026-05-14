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
import "core-js/modules/web.dom-collections.iterator";
// Decorator-call shape (`@wrap(<Map />)`) - decorator IS a call expression whose argument
// is a JSX element. without `decoratorVisitors.JSXIdentifier`, the Map tag-name inside
// the call arg was ignored. shared visitor entry sees it through walkDecorators' subtree
// walk. distinct decorator factories per class pin emission per global - `wrap(<Map/>)`
// against `wrap(<Promise/>)` ensures the JSX-arg path fires twice independently
function wrap(component) {
  return () => {};
}
@wrap(<Map />)
class WithMap {}
@wrap(<Promise />)
class WithPromise {}
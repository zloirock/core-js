// Decorator-call shape (`@wrap(<Map />)`) - decorator IS a call expression whose argument
// is a JSX element. without `decoratorVisitors.JSXIdentifier`, the Map tag-name inside
// the call arg was ignored. shared visitor entry sees it through walkDecorators' subtree
// walk. distinct decorator factories per class pin emission per global - `wrap(<Map/>)`
// against `wrap(<Promise/>)` ensures the JSX-arg path fires twice independently
function wrap(component) { return () => {}; }
@wrap(<Map />)
class WithMap {}
@wrap(<Promise />)
class WithPromise {}

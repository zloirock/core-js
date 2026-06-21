// Decorator-call shape (`@wrap(<Map />)`) - decorator IS a CallExpression whose argument
// is a JSX element. the JSX tag-name (`Map`) inside the call arg must still be scanned for
// global polyfill detection. distinct decorator factories per class pin emission per global:
// `wrap(<Map/>)` vs `wrap(<Promise/>)` makes the JSX-arg path fire twice independently.
function wrap(component) { return () => {}; }
@wrap(<Map />)
class WithMap {}
@wrap(<Promise />)
class WithPromise {}

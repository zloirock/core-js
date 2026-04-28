// bare dynamic `import('core-js')` assigned to a binding then `.then`-chained.
// dynamic import is a runtime call; entry-global only rewrites *static* import
// declarations of `'core-js'`. plugin leaves the dynamic call site untouched
const cjs = import('core-js');
cjs.then(() => {});

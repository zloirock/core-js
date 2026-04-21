// inner pattern holds multiple polyfillable properties — each extracted as a separate
// `const X = _polyfill;` above the original declaration. the last prop to be visited
// empties the inner pattern; when the outer pattern also becomes empty the entire
// VariableDeclaration is removed. no sibling bindings are lost
const { Array: { from, of } } = globalThis;
from([1]);
of(1, 2);

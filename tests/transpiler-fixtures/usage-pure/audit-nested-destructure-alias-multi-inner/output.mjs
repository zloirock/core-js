import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
const from = _Array$from;
// inner pattern holds multiple polyfillable properties — each extracted as a separate
// `const X = _polyfill;` above the original declaration. the last prop to be visited
// empties the inner pattern; when the outer pattern also becomes empty the entire
// VariableDeclaration is removed. no sibling bindings are lost
const of = _Array$of;
from([1]);
of(1, 2);
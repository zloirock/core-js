import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// a multi-declarator VariableDeclaration where the proxy-global flatten declarator comes FIRST
// and the static-destructuring sibling comes second (reverse of the usual order). the flatten
// renders the whole declaration, so the sibling must be skipped order-independently to avoid a
// second whole-declaration replacement (equal-range merge crash). regression lock
const from = _Array$from;
const of = _Array$of;
of;
from([1]);
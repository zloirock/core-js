import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
const from = _Array$from;
// multi-decl where one declarator is a flattenable nested proxy-destructure and the sibling
// references a polyfillable global (bare Identifier or static MemberExpression). flatten's
// raw-text reuse of the sibling needs the identifier visitor to fire on the sibling's globals
// so its transform composes into the outer's replacement; previously walkAstNodes(declaration)
// blanket-skipped the entire VariableDeclaration, leaving siblings un-polyfilled at runtime
const y = _globalThis;
const groupBy = _Map$groupBy;
const sym = _Symbol$iterator;
export { from, y, groupBy, sym };
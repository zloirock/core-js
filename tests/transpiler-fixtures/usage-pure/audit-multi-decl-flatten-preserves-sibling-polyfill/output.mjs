import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// multi-decl where one declarator is a flattenable nested proxy-destructure and the sibling
// references a polyfillable global (bare identifier or static member access). flatten's
// raw-text reuse of the sibling routes the identifier visitor to the sibling's globals so
// its transform composes into the outer's replacement and every sibling reference reaches
// its polyfill at runtime
const from = _Array$from;
const y = _globalThis;
const groupBy = _Map$groupBy;
const sym = _Symbol$iterator;
export { from, y, groupBy, sym };
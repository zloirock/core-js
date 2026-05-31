import _Array$from from "@core-js/pure/actual/array/from";
// `(`-leading polyfill replacement in an UNBRACED `if` body (`if (cond) (se, Array).from(...)`):
// the ASI guard must NOT prepend `;`, which would empty the body and hoist the polyfilled call
// out of the conditional to run unconditionally. a leading `(` cannot fuse with the `if (...)`
// header, so the slice stays verbatim inside the body. unplugin-only - babel's expression-statement
// codegen never strands the body.
let cond = false;
function probe() {}
if (cond) (probe(), _Array$from)([1]);
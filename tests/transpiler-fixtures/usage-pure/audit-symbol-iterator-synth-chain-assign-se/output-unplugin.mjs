import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// destructuring [Symbol.iterator] off a chain-assignment init must PRESERVE the assignment
// side-effect (g = globalThis) inside the synthesized iterator-method extraction, not drop it
let g;
const it = _getIteratorMethod((g = _globalThis));
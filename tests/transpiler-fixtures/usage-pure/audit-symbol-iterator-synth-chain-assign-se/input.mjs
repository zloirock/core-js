// destructuring [Symbol.iterator] off a chain-assignment init must PRESERVE the assignment
// side-effect (g = globalThis) inside the synthesized iterator-method extraction, not drop it
let g;
const { [Symbol.iterator]: it } = (g = globalThis);

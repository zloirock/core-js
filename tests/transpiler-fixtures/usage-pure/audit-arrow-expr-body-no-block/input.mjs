// An arrow with an expression body mirrors the supplied constructor at its closed call site.
// The symbol slot keeps its own value beside the static, without needing a body extraction.
const fn = ({ [Symbol.iterator]: iter, from }) => from([1, 2]);
fn(Array);

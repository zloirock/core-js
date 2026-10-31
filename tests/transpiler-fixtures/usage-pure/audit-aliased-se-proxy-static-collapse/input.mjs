// an aliased proxy-global root behind a side-effect prefix (`(n++, g).Map.groupBy` with `const g =
// globalThis`): the chain-root resolution must peel the sequence tail AND dereference the alias to
// recognise the proxy chain, else the `.Map` constructor member stays unmarked and the unplugin member
// visitor queues an overlapping `(n++, g).Map -> _Map$groupBy` rewrite -> compose crash. a no-SE alias
// (`g.Map.groupBy`) and a literal-rooted SE (`(n++, globalThis).Map`) both collapse cleanly already
const g = globalThis;
let n = 0;
export const r = (n++, g).Map.groupBy([1, 2], x => x);

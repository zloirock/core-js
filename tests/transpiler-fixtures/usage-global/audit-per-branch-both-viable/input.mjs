// usage-global: ConditionalExpression / LogicalExpression destructure where BOTH branches
// resolve to known globals with viable static deps for the destructured key. dispatch
// emits each branch's deps independently at file level - `cond ? Array : Iterator` for
// `from` brings in both `es.array.from` and `es.iterator.from`. body stays unchanged
function f({ from } = cond ? Array : Iterator) { return from; }
const { from: g1 } = cond ? Array : Iterator;
let g2;
({ from: g2 } = cond ? Array : Iterator);
export { f, g1, g2 };

// `in`-check folding to true with a MULTI-element RHS SequenceExpression prefix: every leading
// element is preserved in the replacement and stays visitable, only the dropped in-operand tail
// (`Array`) is skipped. both pushes run and are polyfilled - `(o.push('A'), o.push('B'), true)`.
const o = [];
export const h = 'from' in (o.push('A'), o.push('B'), Array);

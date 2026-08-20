// the structural identity the AST engine is held to, shared by the no-op roundtrip gate
// and the babel-baseline comparator: positions, the literal `raw` spelling, paren nodes
// (the printer normalizes to the minimal structural set), statement-list `EmptyStatement`s
// (semantics-free in a LIST; a loop's empty BODY is a node field and survives) and the
// `shorthand` spelling flag are formatting; `directive` stays - a re-quoted prologue with
// escapes would change which directives the block carries
export function strip(node) {
  while (node?.type === 'ParenthesizedExpression') node = node.expression;
  if (Array.isArray(node)) return node.filter(item => item?.type !== 'EmptyStatement').map(item => strip(item));
  if (node && typeof node === 'object') {
    const out = {};
    for (const key of Object.keys(node).sort()) {
      if (key === 'start' || key === 'end' || key === 'loc' || key === 'range' || key === 'raw' || key === 'hashbang' || key === 'shorthand') continue;
      out[key] = strip(node[key]);
    }
    return out;
  }
  if (typeof node === 'bigint') return `${ node }n`;
  return node;
}

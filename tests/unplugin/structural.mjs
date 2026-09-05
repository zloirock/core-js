// the structural identity the AST engine is held to, shared by the no-op roundtrip gate
// and the babel-baseline comparator. ignored as FORMATTING: positions, the literal `raw`
// spelling (a divergence THERE is a printed-byte defect no tree compare can own - the node
// builders keep `raw` trustworthy instead, and only where it is needed), paren nodes (value
// AND type level - the printer normalizes to the minimal structural set), statement-list
// `EmptyStatement`s (semantics-free in a LIST; a loop's empty BODY is a node field and
// survives), the `shorthand` flag, nested-sequence grouping
// (`(a, (b, c))` == `(a, b, c)` - babel's generator flattens it on reprint), and a sealed
// chain under an OPTIONAL continuation (`(a?.b)?.()` == `a?.b?.()` - runtime-equal for
// every nullish split, and babel prints the unsealed spelling; a seal under a NON-optional
// continuation stays load-bearing and IS compared). `directive` stays - a re-quoted
// prologue with escapes would change which directives the block carries
// the MINTED names (`_ref3`, `_unused5`) number by emission order, which the two legs reach
// differently once any earlier statement differs - the number is formatting, the identity is what
// is compared: within each top-level statement a minted name maps to its order of first appearance
// there (a hoisted `var _ref;` and the statement reading it each number their own)
let mintedNames = null;
function canonicalMinted(name) {
  if (!mintedNames || !/^_(?:ref|unused)\d*$/.test(name)) return name;
  if (!mintedNames.has(name)) mintedNames.set(name, `${ name.replace(/\d+$/, '') }#${ mintedNames.size }`);
  return mintedNames.get(name);
}

export function strip(node) {
  if (node?.type !== 'Program') return stripNode(node);
  const body = node.body.filter(item => item?.type !== 'EmptyStatement').map(item => {
    mintedNames = new Map();
    try {
      return stripNode(item);
    } finally {
      mintedNames = null;
    }
  });
  return { ...stripNode({ ...node, body: [] }), body };
}

function stripNode(node) {
  while (node?.type === 'ParenthesizedExpression') node = node.expression;
  while (node?.type === 'TSParenthesizedType') node = node.typeAnnotation;
  if (Array.isArray(node)) return node.filter(item => item?.type !== 'EmptyStatement').map(item => strip(item));
  if (node && typeof node === 'object') {
    if (node.type === 'SequenceExpression') {
      const flat = [];
      (function flatten(expressions) {
        for (let item of expressions) {
          while (item?.type === 'ParenthesizedExpression') item = item.expression;
          if (item?.type === 'SequenceExpression') flatten(item.expressions);
          else flat.push(item);
        }
      })(node.expressions);
      return { expressions: flat.map(item => strip(item)), type: 'SequenceExpression' };
    }
    // spelling-normalization loop, to a fixed point (a lift can expose the other):
    // `new ((f || g)<string>)()` == `new ((f || g))<string>()` - the instantiation is
    // type-level spelling, babel hoists its arguments onto the call/new host; and a sealed
    // chain under an OPTIONAL continuation unseals (see the header)
    for (let normalized = true; normalized;) {
      normalized = false;
      if ((node.type === 'CallExpression' || node.type === 'NewExpression' || node.type === 'TaggedTemplateExpression') && !node.typeArguments) {
        const key = node.type === 'TaggedTemplateExpression' ? 'tag' : 'callee';
        let target = node[key];
        while (target?.type === 'ParenthesizedExpression') target = target.expression;
        if (target?.type === 'TSInstantiationExpression') {
          node = { ...node, [key]: target.expression, typeArguments: target.typeArguments ?? target.typeParameters };
          normalized = true;
          continue;
        }
      }
      if ((node.type === 'CallExpression' || node.type === 'MemberExpression') && node.optional) {
        const key = node.type === 'CallExpression' ? 'callee' : 'object';
        let target = node[key];
        while (target?.type === 'ParenthesizedExpression') target = target.expression;
        if (target?.type === 'ChainExpression') {
          node = { ...node, [key]: target.expression };
          normalized = true;
        }
      }
    }
    const out = {};
    for (const key of Object.keys(node).sort()) {
      if (key === 'start' || key === 'end' || key === 'loc' || key === 'range' || key === 'raw' || key === 'shorthand') continue;
      out[key] = key === 'name' && node.type === 'Identifier' ? canonicalMinted(node[key]) : strip(node[key]);
    }
    return out;
  }
  if (typeof node === 'bigint') return `${ node }n`;
  return node;
}

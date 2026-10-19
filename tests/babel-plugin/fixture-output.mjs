// Variant comparisons ignore enum tail commas and redundant type parentheses.
// Other bytes stay exact; removing type parentheses must preserve the parsed tree.
export function normalizeFixtureOutput(code, babel, parserOpts, variant) {
  if (!variant || code === null) return code;
  const typescript = parserOpts?.plugins?.some(plugin => (Array.isArray(plugin) ? plugin[0] : plugin) === 'typescript');
  if (!/\benum\b/u.test(code) && !(typescript && code.includes('('))) return code;
  function parse(source) {
    // eslint-disable-next-line node/no-sync -- fixture comparison normalizers are synchronous
    return babel.parseSync(source, {
      configFile: false,
      babelrc: false,
      parserOpts: { ...parserOpts, tokens: true, startIndex: 0, startLine: 1, startColumn: 0 },
    });
  }
  let ast;
  try {
    ast = parse(code);
  } catch {
    // A comparison must still catch malformed output or a dialect we cannot reparse.
    return code;
  }
  if (ast.errors.length) return code;

  const memberEnds = new Set();
  const typeStarts = new Map();
  babel.types.traverseFast(ast.program, node => {
    if (node.type === 'TSEnumDeclaration') {
      // Babel 8 puts the members in a body node; Babel 7 keeps them on the declaration.
      const members = node.body?.members ?? node.members;
      if (members.length) memberEnds.add(members.at(-1).end);
    } else if (node.type === 'TSParenthesizedType') typeStarts.set(node.start, node.typeAnnotation.start);
    else if (babel.types.isTSType(node) && node.extra?.parenthesized) {
      // Babel 8 records type parentheses on the inner node instead of retaining a wrapper.
      typeStarts.set(node.extra.parenStart, node.start);
    }
  });

  let previousEnd;
  const commas = new Set();
  const parens = new Set();
  const stack = [];
  for (const token of ast.tokens) {
    if (typeof token.type === 'string') continue; // Comments do not separate a member from its comma.
    if (token.type.label === ',' && memberEnds.has(previousEnd)) commas.add(token.start);
    else if (token.type.label === '(') {
      // Nested spelling parentheses share the same inner type boundary.
      stack.push([token.start, typeStarts.get(token.start) ?? stack.at(-1)?.[1]]);
    } else if (token.type.label === ')') {
      const [open, inner] = stack.pop();
      if (open < inner) {
        parens.add(open);
        parens.add(token.start);
      }
    }
    previousEnd = token.end;
  }

  function without(positions) {
    let start = 0;
    const parts = [];
    for (const token of ast.tokens) {
      if (!positions.has(token.start)) continue;
      parts.push(code.slice(start, token.start));
      start = token.end;
    }
    parts.push(code.slice(start));
    return parts.join('');
  }
  if (parens.size) {
    const candidate = without(commas.union(parens));
    try {
      const reparsed = parse(candidate);
      if (!reparsed.errors.length) {
        for (const tree of [ast, reparsed]) babel.traverse(tree, {
          noScope: true,
          TSParenthesizedType(path) { path.replaceWith(path.node.typeAnnotation); },
        });
        if (babel.types.isNodesEquivalent(ast.program, reparsed.program)) return candidate;
      }
    } catch {
      // Required grouping or a parser restriction keeps the original type spelling.
    }
  }
  return without(commas);
}

// Variant comparisons ignore Babel 7's TS enum tail comma, which Babel 8 omits.
// Strings, comments, array holes and every other byte remain observable.
export function normalizeEnumTrailingCommas(code, babel, parserOpts, variant) {
  if (!variant || code === null || !/\benum\b/u.test(code)) return code;
  let ast;
  try {
    // eslint-disable-next-line node/no-sync -- fixture comparison normalizers are synchronous
    ast = babel.parseSync(code, {
      configFile: false,
      babelrc: false,
      parserOpts: { ...parserOpts, tokens: true, startIndex: 0, startLine: 1, startColumn: 0 },
    });
  } catch {
    // A comparison must still catch malformed output or a dialect we cannot reparse.
    return code;
  }
  if (ast.errors.length) return code;

  const memberEnds = new Set();
  babel.types.traverseFast(ast.program, node => {
    if (node.type === 'TSEnumDeclaration') {
      // Babel 8 puts the members in a body node; Babel 7 keeps them on the declaration.
      const members = node.body?.members ?? node.members;
      if (members.length) memberEnds.add(members.at(-1).end);
    }
  });

  let previousEnd;
  let start = 0;
  const parts = [];
  for (const token of ast.tokens) {
    if (typeof token.type === 'string') continue; // Comments do not separate a member from its comma.
    if (token.type.label === ',' && memberEnds.has(previousEnd)) {
      parts.push(code.slice(start, token.start));
      start = token.end;
    }
    previousEnd = token.end;
  }
  parts.push(code.slice(start));
  return parts.join('');
}

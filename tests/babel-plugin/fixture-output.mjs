import { parse as parseProgram } from '@babel/parser';
import { singleQuasiString } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { moduleSpecifiers } from '../unplugin/phase-imports.mjs';
import { fileURLToPath } from 'node:url';

// A filesystem separator is one backslash. Its spelling in emitted JS strings is two.
export function slashifyPath(machinePath) {
  return machinePath.replaceAll('\\', '/');
}

const ROOT_URL = new URL('../../', import.meta.url);
const ROOT_PATH = slashifyPath(fileURLToPath(ROOT_URL));

// Diagnostics can spell the checkout as a file URL or a native path.
export function normalizeDiagnosticPaths(text, rootPath = ROOT_PATH, rootURL = ROOT_URL.href) {
  const windowsRoot = rootPath.replaceAll('/', '\\');
  return text.replaceAll(rootURL, '<CWD>/').replaceAll(rootPath, '<CWD>/')
    .replaceAll(windowsRoot.replaceAll('\\', '\\\\'), '<CWD>/').replaceAll(windowsRoot, '<CWD>/')
    .replaceAll(/<CWD>\/[^\s"')\]]*/gu, part => part.replaceAll('\\\\', '/').replaceAll('\\', '/'));
}

// Snapshot portability applies only to module specifiers. A user string or raw template
// can contain exactly the same bytes as a checkout path and must remain observable.
export function normalizeMachinePaths(code, { rootPath = ROOT_PATH, rootURL = ROOT_URL.href, parserOpts } = {}) {
  if (!code.includes(rootPath) && !code.includes(rootURL) && !code.includes('\\\\')) return code;
  const options = { sourceType: 'unambiguous', allowReturnOutsideFunction: true, ...parserOpts, startIndex: 0, startLine: 1, startColumn: 0 };
  // Without a fixture dialect, JSX and an angle-bracket TS assertion require different parses.
  let ast;
  for (const plugins of options.plugins ? [options.plugins] : [['typescript', 'jsx'], ['typescript']]) {
    try {
      const parsed = parseProgram(code, { ...options, plugins });
      if (!parsed.errors.length) {
        ast = parsed;
        break;
      }
    } catch { /* keep malformed and unsupported source byte-exact */ }
  }
  if (!ast) return code;
  const parts = [];
  let cursor = 0;
  // A load in a callee sequence precedes the outer call's specifier in the source.
  const literals = moduleSpecifiers(ast.program, options.sourceFilename).sort((a, b) => a.start - b.start);
  for (const literal of literals) {
    const value = typeof literal?.value === 'string' ? literal.value : singleQuasiString(literal);
    if (value === null) continue;
    const { start, end } = literal;
    let portable = /^(?:[A-Za-z]:[/\\]|\\\\)/u.test(value) ? slashifyPath(value) : value;
    if (portable.startsWith(rootURL)) portable = `<CWD>/${ portable.slice(rootURL.length) }`;
    else if (portable.startsWith(rootPath)) portable = `<CWD>/${ portable.slice(rootPath.length) }`;
    if (portable === value) continue;
    let escaped = JSON.stringify(portable).slice(1, -1);
    if (code[start] === "'") escaped = escaped.replaceAll("'", "\\'");
    else if (code[start] === '`') escaped = escaped.replaceAll('`', '\\`').replaceAll('${', '\\${');
    parts.push(code.slice(cursor, start + 1), escaped);
    cursor = end - 1;
  }
  return parts.length ? parts.join('') + code.slice(cursor) : code;
}

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

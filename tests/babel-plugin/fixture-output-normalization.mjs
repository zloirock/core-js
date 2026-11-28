import { equal, notEqual, ok } from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { normalizeDiagnosticPaths, normalizeFixtureOutput, normalizeMachinePaths } from './fixture-output.mjs';

for (const [directory, windows] of [
  ['D:/a/core-js/core-js/', true],
  ['//server/share/repo # %/', true],
  ['/tmp/repo # %/', false],
]) {
  const file = pathToFileURL(`${ directory }packages/example#.js`, { windows });
  const url = new URL('../', file).href;
  const sibling = `${ url.slice(0, -1) }-other/file.js`;
  for (const [source, expected] of [
    [`import "${ file.href }?mode=raw#part";`, 'import "<CWD>/packages/example%23.js?mode=raw#part";'],
    [`require("${ directory }packages/example.js");`, 'require("<CWD>/packages/example.js");'],
    [sibling, sibling],
  ]) equal(normalizeMachinePaths(source, { rootPath: directory, rootURL: url }), expected);
}

const windowsPath = String.raw`D:\repo\module.js`;
const moduleLiteral = JSON.stringify(windowsPath);
for (const original of [
  `const data = ${ moduleLiteral };`,
  `const text = 'import ' + ${ moduleLiteral };`,
  `// require(${ moduleLiteral })`,
  'const raw = String.raw`a\\\\b`;',
  `obj.require(${ moduleLiteral });`,
  `function receive(require) { return require(${ moduleLiteral }); }`,
  `function receive(require) { return require?.(${ moduleLiteral }); }`,
  `with ({ require: deliver }) require(${ moduleLiteral });`,
]) equal(normalizeMachinePaths(original), original);
const nestedLoads = `(require(${ moduleLiteral }), require)(${ moduleLiteral });`;
equal(normalizeMachinePaths(nestedLoads), nestedLoads.replaceAll(moduleLiteral, '"D:/repo/module.js"'));
// eslint-disable-next-line no-template-curly-in-string -- literal template source for the parser
const fixedTemplate = 'import(`D:/repo/file\\`\\${name}.js`);';
equal(normalizeMachinePaths(fixedTemplate, { rootPath: 'D:/repo/' }), fixedTemplate.replace('D:/repo/', '<CWD>/'));
// eslint-disable-next-line no-template-curly-in-string -- the path depends on a runtime substitution
const dynamicTemplate = 'import(`D:/repo/${name}.js`);';
equal(normalizeMachinePaths(dynamicTemplate, { rootPath: 'D:/repo/' }), dynamicTemplate);
const grouped = `(require)((${ moduleLiteral }));`;
equal(normalizeMachinePaths(grouped, { parserOpts: { createParenthesizedExpressions: true } }), grouped.replace(moduleLiteral, '"D:/repo/module.js"'));
for (const source of [`export * from ${ moduleLiteral };`, `import(${ moduleLiteral });`, `require(${ moduleLiteral });`, `require?.(${ moduleLiteral });`]) {
  equal(normalizeMachinePaths(source), source.replace(moduleLiteral, '"D:/repo/module.js"'));
}
equal(normalizeMachinePaths(`const marker = ${ moduleLiteral }; import(${ moduleLiteral });`),
  `const marker = ${ moduleLiteral }; import("D:/repo/module.js");`);
for (const syntax of ['const a = <number>x;', 'const a = <div />;']) {
  equal(normalizeMachinePaths(`import ${ moduleLiteral }; ${ syntax }`), `import "D:/repo/module.js"; ${ syntax }`);
}
equal(normalizeDiagnosticPaths(windowsPath, 'D:/repo/'), '<CWD>/module.js');

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const babel = requireBabel('@babel/core');
const parserOpts = { sourceType: 'module', plugins: ['typescript'] };
function normalize(code, options = parserOpts) {
  return normalizeFixtureOutput(code, babel, options, 'babel-v7');
}

for (const [source, expected] of [
  ['enum E { A, B, }', 'enum E { A, B }'],
  ['const enum E { A, }', 'const enum E { A }'],
  ['declare enum E { A = "a", }', 'declare enum E { A = "a" }'],
  ['namespace N { enum E { A, } } enum F { B, }', 'namespace N { enum E { A } } enum F { B }'],
  ['enum E { A /* before */, /* after */ }', 'enum E { A /* before */ /* after */ }'],
  ['enum E { A, // tail\n}', 'enum E { A // tail\n}'],
  ['enum E {\r\n  A,\r\n}', 'enum E {\r\n  A\r\n}'],
  ['enum E { A = ({ x: [1,,], }).x[0] as any, }', 'enum E { A = ({ x: [1,,], }).x[0] as any }'],
  ['enum E { A = `enum Fake { B, }`, }', 'enum E { A = `enum Fake { B, }` }'],
]) {
  equal(normalize(source), expected);
  equal(normalize(expected), expected);
}

for (const source of [
  'enum E {}',
  'const enumLike = "enum E { A, }";',
  'const enumLike = `enum E { A, }`;',
  'const pattern = /enum E { A, }/;',
  '// enum E { A, }\nconst obj = { enum: 1, };',
  '/* enum E { A, } */ const holes = [1,,];',
  'enum E { A,, }',
  'enum E { A, } const broken = ;',
]) equal(normalize(source), source);
equal(normalize(null), null);
for (const variant of [undefined, '']) {
  equal(normalizeFixtureOutput('enum E { A, }', babel, parserOpts, variant), 'enum E { A, }');
}
equal(normalize('enum E { A, }', { ...parserOpts, startIndex: 40, startLine: 3, startColumn: 2 }), 'enum E { A }');
equal(normalize('enum E { A, } const view = <span />;', { ...parserOpts, plugins: ['typescript', 'jsx'] }),
  'enum E { A } const view = <span />;');
equal(normalize('enum E { A, } class C { accessor x = 1; }',
  { ...parserOpts, plugins: ['typescript', 'decoratorAutoAccessors'] }), 'enum E { A } class C { accessor x = 1; }');
const recovered = 'enum E { A, } const x = 1; const x = 2;';
equal(normalize(recovered, { ...parserOpts, errorRecovery: true }), recovered);

// An enum inside a long expression still belongs to the comparison.
const deep = `const x = (() => { enum E { A, } return E.A; })()${ ' + a'.repeat(1100) };`;
equal(normalize(deep), deep.replace('A,', 'A'));

// Import, value, ordering and punctuation changes outside the enum tail must still fail comparison.
for (const [left, right] of [
  ['import "core-js/modules/es.array.at"; enum E { A, }', 'enum E { A }'],
  ['enum E { A = 1, }', 'enum E { A = 2 }'],
  ['enum E { A, B, }', 'enum E { B, A }'],
  ['enum E { A = [1,,] as any, }', 'enum E { A = [1,] as any }'],
  ['enum E { A, } // comment', 'enum E { A }'],
  ['enum E { A, } const obj = { x: 1, };', 'enum E { A } const obj = { x: 1 };'],
]) notEqual(normalize(left), normalize(right));

// Type-only grouping is cosmetic only when reparsing keeps the same type tree.
for (const [source, expected] of [
  ['type X = (number[]);', 'type X = number[];'],
  ['type X = A & (B);', 'type X = A & B;'],
  ['declare const x: ([number[], string])[0];', 'declare const x: [number[], string][0];'],
  ['type X = ({ items: string[] })["items"];', 'type X = { items: string[] }["items"];'],
  ['type X = ReturnType<(typeof f)>;', 'type X = ReturnType<typeof f>;'],
  ['type X = ((() => number[]));', 'type X = () => number[];'],
  ['type M<T> = { [K in (keyof T)]: (T)[K] };', 'type M<T> = { [K in keyof T]: T[K] };'],
  ['type X = (/* keep */ number);', 'type X = /* keep */ number;'],
  ['enum E { A, } type X = (number);', 'enum E { A } type X = number;'],
]) {
  equal(normalize(source), expected);
  equal(normalize(expected), expected);
}

for (const source of [
  'type X = (A | B)[];',
  'type X = A & (B | C);',
  'type X = (() => number)[];',
  'type X = (A | B)[]; type Y = (number);',
  'const value = ((o.m)<T>)?.();',
  'const text = "type X = (number)";',
  '// type X = (number)\nconst x = (f || g);',
]) equal(normalize(source), source);
equal(normalize('enum E { A, } type X = (A | B)[];'), 'enum E { A } type X = (A | B)[];');
equal(normalize('type X = (number);', { ...parserOpts, plugins: [['typescript', { dts: true }]] }), 'type X = number;');
equal(normalize('type X = (number);', { ...parserOpts, plugins: ['flow'] }), 'type X = (number);');
for (const variant of [undefined, '']) {
  equal(normalizeFixtureOutput('type X = (number);', babel, parserOpts, variant), 'type X = (number);');
}
for (const [left, right] of [
  ['type X = (A | B)[];', 'type X = A | B[];'],
  ['type X = A & (B | C);', 'type X = (A & B) | C;'],
  ['type X = (number);', 'type X = string;'],
  ['type X = (number); // keep', 'type X = number;'],
  ['const x = (f || g)<T>;', 'const x = f || g<T>;'],
  ['o.m<T>?.(); type X = (number);', 'o.m?.<T>(); type X = number;'],
  ['import type X = require("x"); type Y = (number);', 'import X = require("x"); type Y = number;'],
]) notEqual(normalize(left), normalize(right));

// Count boundary comparisons rather than wall time: independent types must scale linearly.
let comparisons = 0;
const countedBabel = { ...babel, types: { ...babel.types, traverseFast(ast, visit) {
  babel.types.traverseFast(ast, node => {
    const inner = node.type === 'TSParenthesizedType' ? node.typeAnnotation
      : babel.types.isTSType(node) && node.extra?.parenthesized ? node : null;
    if (inner) {
      const { start } = inner;
      inner.start = { valueOf() {
        comparisons++;
        return start;
      } };
    }
    visit(node);
  });
} } };
const batch = Array.from({ length: 128 }, (_, index) => `type T${ index } = (number);`).join('\n');
equal(normalizeFixtureOutput(batch, countedBabel, parserOpts, 'babel-v7'), batch.replaceAll('(number)', 'number'));
ok(comparisons > 0 && comparisons <= 256);

echo(chalk.green('fixture-output-normalization: enum tails, type grouping and comparison boundaries passed'));

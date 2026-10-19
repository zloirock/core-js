import { equal, notEqual } from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { normalizeEnumTrailingCommas } from './fixture-output.mjs';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const babel = requireBabel('@babel/core');
const parserOpts = { sourceType: 'module', plugins: ['typescript'] };
function normalize(code, options = parserOpts) {
  return normalizeEnumTrailingCommas(code, babel, options, 'babel-v7');
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
  equal(normalizeEnumTrailingCommas('enum E { A, }', babel, parserOpts, variant), 'enum E { A, }');
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

echo(chalk.green('fixture-output-normalization: enum tails and comparison boundaries passed'));

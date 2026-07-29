// Unit tests for re-transform stability: a build can run the plugin over already-transformed output
// (a second pass, a sibling that re-emits, `phase: 'pre+post'`), and the injection set has to be a
// fixed point there. a second pass that re-injects would duplicate imports, and one that drops an
// import would leave the polyfill missing - both are silent, since the FIRST pass looks correct
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import * as nodePath from 'node:path';
import { createChecker } from '../polyfill-provider/harness.mjs';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ nodePath.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');

const { check, finish } = createChecker('transform-idempotence');

// one representative per mechanism the defense cycle touched: the answer each one produces has to
// survive being fed its own output
const CASES = [
  ['patched static', 'Object.create = shim;\nvar o = Object.create(null);\nexport const r = o.at(0);'],
  ['reachable-value union', 'let x = null;\nconst f = () => x.at(0);\nx = [1];\nexport const r = f();'],
  ['installed prototype', 'let o = { __proto__: Array.prototype };\nexport const r = o.at(-1);'],
  ['patch through a proxy import', 'import g from "core-js/actual/global-this";\ng.Object.create = shim;\nvar o = Object.create(null);\nexport const r = o.at(0);'],
  ['patch through a lowered require', 'var g = require("core-js/actual/global-this");\ng.Object.create = shim;\nvar o = Object.create(null);\nexport const r = o.at(0);'],
  ['prototype patch', 'Array.prototype.at = shim;\nvar a = [1];\nexport const r = a.at(0);'],
  // declaration-driven resolution: the type each of these reads is re-derived from source on the
  // second pass, so a rule that depends on statement ORDER or on a declaration's neighbours has to
  // land on the same answer once the injected imports sit in front of it
  ['enum member kind', 'enum E { A = "x", B }\nconst v = E.B;\nexport const r = v.at(0);', true],
  ['discriminant narrow', 'type U = { k: 1; v: number[]; } | { k: "1"; v: string; };\ndeclare const u: U;\nexport const r = u.k === 1 ? u.v.at(0) : "";', true],
  ['branch-exit narrow', 'declare const c: boolean;\nexport function f() {\n  let x: number[] | string = [1, 2, 3];\n'
    + '  if (c) { x = "abc"; } else { return; }\n  return x.at(0);\n}', true],
  ['typeof member of a reassigned container', 'let o = { f: [1, 2, 3] };\no = { f: "t" } as any;\ndeclare const q: typeof o.f;\nexport const r = q.at(0);', true],
  ['overload retarget', 'declare function fn(x: number): number[];\ndeclare function fn(x: string): number[];\n'
    + 'declare const q: ReturnType<typeof fn>;\nexport const r = q.at(0);', true],
  ['boxed-wrapper conditional', 'type C<T> = T extends String ? number[] : string;\ndeclare const v: C<string>;\nexport const r = v.at(0);', true],
  ['mapped key-set', 'type M<T> = { [K in keyof { a: unknown; }]: T[K] };\ndeclare const p: M<{ a: number[]; extra: string; }>;\nexport const r = p.a.at(0);', true],
  ['type-param shadows a container', 'export function f<Array>(x: Array) { return x.at(0); }', true],
];

const OPTIONS = { method: 'usage-global', version: '4.0', targets: { ie: 11 } };

function injectedModules(code) {
  return code.matchAll(/modules\/(?<name>[\w\-.]+)"/g).map(match => match.groups.name).toArray();
}

for (const [label, source, ts] of CASES) {
  // a TS case keeps its annotations in the output, so the second pass re-parses them - hence the
  // parser plugin and a filename the pipeline reads as TS
  const config = {
    configFile: false, babelrc: false, plugins: [[babelPlugin, OPTIONS]],
    filename: ts ? 'input.ts' : 'input.mjs',
    ...ts && { parserOpts: { plugins: ['typescript'] } },
  };
  const first = (await transformAsync(source, config)).code;
  const second = (await transformAsync(first, config)).code;
  const before = injectedModules(first);
  const after = injectedModules(second);
  check(`re-transform keeps the set: ${ label }`, after.join(','), before.join(','));
  check(`re-transform adds no duplicate: ${ label }`, after.length, new Set(after).size);
}

finish();

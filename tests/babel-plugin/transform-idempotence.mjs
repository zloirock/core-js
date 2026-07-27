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
];

const OPTIONS = { method: 'usage-global', version: '4.0', targets: { ie: 11 } };

function injectedModules(code) {
  return code.matchAll(/modules\/(?<name>[\w\-.]+)"/g).map(match => match.groups.name).toArray();
}

for (const [label, source] of CASES) {
  const first = (await transformAsync(source, {
    configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, OPTIONS]],
  })).code;
  const second = (await transformAsync(first, {
    configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, OPTIONS]],
  })).code;
  const before = injectedModules(first);
  const after = injectedModules(second);
  check(`re-transform keeps the set: ${ label }`, after.join(','), before.join(','));
  check(`re-transform adds no duplicate: ${ label }`, after.length, new Set(after).size);
}

finish();

// Transpiler performance gates: REAL large single-scope bundles (three.js builds, pinned in
// THIS directory's package.json - zxi installs it) plus a synthetic reassignment-heavy
// stress, through BOTH emitters in
// usage-global mode. The bounds are complexity-CLASS discriminators with wide headroom - a
// quadratic scope / flow-analysis regression overshoots them on any machine, ordinary machine
// variance does not. The synthetic deliberately maximizes WRITTEN top-level names: real
// bundles rarely reassign at that density, and quadratic roots in the reassignment / flow
// machinery are invisible on three.js yet catastrophic on this shape. Each transform also
// asserts an injection happened, so a detection-dead run cannot pass vacuously fast.
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformAsync } from '@babel/core';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';

const { cyan, green, red } = chalk;
const HERE = dirname(fileURLToPath(import.meta.url));
const MODES = ['usage-global', 'usage-pure'];

function syntheticSingleScope(names) {
  const pad = Array.from({ length: 100 }, (unused, k) => k).join(', ');
  const parts = [];
  for (let i = 0; i < names; i++) {
    parts.push(`var v${ i } = [${ i }]; v${ i } = [${ i }, 1]; v${ i }.at(0);`,
      `function pad${ i }(a) { return [${ pad }].length + a; }`);
  }
  return parts.join('\n');
}

// every use in the reassignment synthetic asks the preceding-sibling guard scan too, but a
// guard-DENSE list additionally pays the guard extraction per statement - a quadratic in
// either the scan or the extraction overshoots this shape first
function syntheticGuardDense(names) {
  const parts = [];
  for (let i = 0; i < names; i++) {
    parts.push(`var g${ i } = [${ i }]; if (typeof g${ i } !== 'object') throw new Error('x'); g${ i } = [${ i }, 1]; g${ i }.at(0);`);
  }
  return parts.join('\n');
}

// discriminated-union receivers walk the discriminant sibling scan per member use - a
// quadratic there needs union-annotated bindings, which no other synthetic carries
function syntheticDiscriminantDense(names) {
  const parts = ["type U = { kind: 'a', v: string } | { kind: 'b', v: string[] };"];
  for (let i = 0; i < names; i++) {
    parts.push(`declare const u${ i }: U;`, `if (u${ i }.kind !== 'a') throw new Error('x');`, `u${ i }.v.at(${ i });`);
  }
  return parts.join('\n');
}

// assignment-form ctor aliases make babel drop the binding from its scope registry, so every
// member use walks the lagged-binding recovery - a quadratic there is invisible on the
// reassignment synthetic above (its bindings never lag) yet catastrophic on this shape
function syntheticLaggedAliases(names) {
  const parts = [`let ${ Array.from({ length: names }, (unused, i) => `g${ i }`).join(', ') };`];
  for (let i = 0; i < names; i++) {
    parts.push(`({ Map: g${ i } } = globalThis);`, `g${ i } = [${ i }];`, `g${ i }.at(0);`);
  }
  return parts.join('\n');
}

function threeBuild(file) {
  return readFile(join(HERE, `node_modules/three/build/${ file }`), 'utf8');
}

// bounds are per (mode, emitter): usage-pure REWRITES every detected use, so its budgets run
// higher than the injection-only usage-global ones
const CASES = [
  { name: 'three.core.js', source: () => threeBuild('three.core.js'), bounds: {
    'usage-global': { babel: 6, unplugin: 5 }, 'usage-pure': { babel: 8, unplugin: 5 },
  } },
  { name: 'three.module.js', source: () => threeBuild('three.module.js'), bounds: {
    'usage-global': { babel: 3, unplugin: 3 }, 'usage-pure': { babel: 3, unplugin: 3 },
  } },
  { name: 'synthetic single-scope, 2000 reassigned names', source: () => syntheticSingleScope(2000), bounds: {
    'usage-global': { babel: 15, unplugin: 10 }, 'usage-pure': { babel: 15, unplugin: 10 },
  } },
  // under @babel/generator's 500kb styling-deopt threshold, so the NORMAL codegen path is
  // gated too - the big twin above always runs the deoptimised one
  { name: 'synthetic single-scope, 640 reassigned names', source: () => syntheticSingleScope(640), bounds: {
    'usage-global': { babel: 6, unplugin: 4 }, 'usage-pure': { babel: 6, unplugin: 3 },
  } },
  { name: 'synthetic lagged aliases, 1000 names', source: () => syntheticLaggedAliases(1000), bounds: {
    'usage-global': { babel: 6, unplugin: 4 }, 'usage-pure': { babel: 6, unplugin: 4 },
  } },
  { name: 'synthetic guard-dense, 1500 names', source: () => syntheticGuardDense(1500), bounds: {
    'usage-global': { babel: 6, unplugin: 4 }, 'usage-pure': { babel: 6, unplugin: 4 },
  } },
  { name: 'synthetic discriminant-dense, 1600 names', source: () => syntheticDiscriminantDense(1600), ts: true, bounds: {
    'usage-global': { babel: 6, unplugin: 4 }, 'usage-pure': { babel: 6, unplugin: 4 },
  } },
];

// usage-pure rewrites sites to `@core-js/pure` imports; usage-global prepends `core-js/modules`
const INJECTION_MARK = { 'usage-global': 'core-js/modules/', 'usage-pure': '@core-js/pure' };

async function transformWith(emitter, mode, source, ts) {
  const options = { method: mode, version: '4.0', targets: { ie: 11 } };
  const filename = ts ? 'input.ts' : 'input.mjs';
  if (emitter === 'babel') {
    const out = await transformAsync(source, {
      plugins: [[babelPlugin, options]],
      filename,
      sourceType: 'module',
      parserOpts: ts ? { plugins: ['typescript'] } : undefined,
      configFile: false,
      babelrc: false,
    });
    return out.code;
  }
  return createUnplugin(options).transform(source, filename)?.code;
}

let failed = 0;
for (const { name, source, ts = false, bounds } of CASES) {
  const input = await source();
  for (const mode of MODES) {
    for (const emitter of ['babel', 'unplugin']) {
      const start = performance.now();
      const code = await transformWith(emitter, mode, input, ts);
      const seconds = (performance.now() - start) / 1000;
      const injected = !!code && code.includes(INJECTION_MARK[mode]);
      const ok = injected && seconds < bounds[mode][emitter];
      if (!ok) failed++;
      echo`${ ok ? green('PASS') : red('FAIL') } ${ cyan(name) } (${ Math.round(input.length / 1024) }kb) | ${ mode } ${ emitter }: ${ seconds.toFixed(2) }s (bound ${ bounds[mode][emitter] }s${ injected ? '' : ', NO INJECTION' })`;
    }
  }
}
if (failed) throw new Error('Some transpiler performance gates have failed');

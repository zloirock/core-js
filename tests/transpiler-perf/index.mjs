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
];

// usage-pure rewrites sites to `@core-js/pure` imports; usage-global prepends `core-js/modules`
const INJECTION_MARK = { 'usage-global': 'core-js/modules/', 'usage-pure': '@core-js/pure' };

async function transformWith(emitter, mode, source) {
  const options = { method: mode, version: '4.0', targets: { ie: 11 } };
  if (emitter === 'babel') {
    const out = await transformAsync(source, {
      plugins: [[babelPlugin, options]],
      filename: 'input.mjs',
      sourceType: 'module',
      configFile: false,
      babelrc: false,
    });
    return out.code;
  }
  return createUnplugin(options).transform(source, 'input.mjs')?.code;
}

let failed = 0;
for (const { name, source, bounds } of CASES) {
  const input = await source();
  for (const mode of MODES) {
    for (const emitter of ['babel', 'unplugin']) {
      const start = performance.now();
      const code = await transformWith(emitter, mode, input);
      const seconds = (performance.now() - start) / 1000;
      const injected = !!code && code.includes(INJECTION_MARK[mode]);
      const ok = injected && seconds < bounds[mode][emitter];
      if (!ok) failed++;
      echo`${ ok ? green('PASS') : red('FAIL') } ${ cyan(name) } (${ Math.round(input.length / 1024) }kb) | ${ mode } ${ emitter }: ${ seconds.toFixed(2) }s (bound ${ bounds[mode][emitter] }s${ injected ? '' : ', NO INJECTION' })`;
    }
  }
}
if (failed) throw new Error('Some transpiler performance gates have failed');

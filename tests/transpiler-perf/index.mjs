// Transpiler performance gates: REAL large single-scope bundles (three.js builds, pinned in
// THIS directory's package.json - zxi installs it) plus a synthetic reassignment-heavy
// stress, through BOTH emitters in
// usage-global mode. The bounds are complexity-CLASS discriminators with wide headroom - a
// quadratic scope / flow-analysis regression overshoots them on any machine, ordinary machine
// variance does not. The synthetic deliberately maximizes WRITTEN top-level names: real
// bundles rarely reassign at that density, and quadratic roots in the reassignment / flow
// machinery are invisible on three.js yet catastrophic on this shape. Each transform also
// asserts an injection happened, so a detection-dead run cannot pass vacuously fast.
//
// A case's `source()` may also return an ARRAY of module sources, transformed one-by-one the way
// a bundler feeds them. Those cases gate the PER-CALL axis: everything above pays setup once on a
// huge input, so a regression in per-file work (a cache that stops being reused across calls, say)
// is invisible there and shows up only when the same bytes arrive as hundreds of separate calls.
import { readdir, readFile } from 'node:fs/promises';
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

// a published package carries a long tail of re-export stubs and one-line constant modules; below
// this size a module is pure call overhead with no work to measure, which would let a bloated tail
// drown the signal the case is meant to carry
const TRIVIAL_MODULE_BYTES = 200;

// every `.js` under the given package directories, as separate module sources
async function packageModules(...directories) {
  const sources = [];
  for (const directory of directories) {
    const base = join(HERE, 'node_modules', directory);
    for (const file of await readdir(base, { recursive: true })) {
      if (!file.endsWith('.js')) continue;
      const code = await readFile(join(base, file), 'utf8');
      if (code.length > TRIVIAL_MODULE_BYTES) sources.push(code);
    }
  }
  return sources;
}

// the view-independent CodeMirror stack: editor state plus the Lezer runtime and one grammar
const CODEMIRROR_DIRECTORIES = ['@codemirror/state/dist', '@lezer/common/dist', '@lezer/lr/dist',
  '@lezer/highlight/dist', '@lezer/javascript/dist'];

// bounds are per (mode, emitter): usage-pure REWRITES every detected use, so its budgets run
// higher than the injection-only usage-global ones. `injections` is the vacuous-run floor - how
// many modules must inject. Single-source cases need their one; multi-module ones cannot demand
// every module (a package always holds files with nothing to polyfill) but must not settle for
// one either, or detection could die everywhere but a single module and still pass - faster, and
// so further inside the bound. Floors sit well under the current counts: rxjs injects in 65/212
// modules under usage-global and 47/212 under usage-pure, codemirror in 4/6 under both
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
  // per-call axis, two granularities: rxjs spreads 233kb over ~210 tiny modules so call overhead
  // dominates, the codemirror set puts 402kb in 6 mid-sized ones so per-file work and bytes both show
  { name: 'rxjs esm, tiny modules', source: () => packageModules('rxjs/dist/esm'), injections: 20, bounds: {
    'usage-global': { babel: 6, unplugin: 4 }, 'usage-pure': { babel: 6, unplugin: 4 },
  } },
  { name: 'codemirror + lezer, mid-sized modules', source: () => packageModules(...CODEMIRROR_DIRECTORIES), injections: 3, bounds: {
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
for (const { name, source, ts = false, injections = 1, bounds } of CASES) {
  const input = await source();
  // single-source cases are just a one-module list; multi-module ones gate the per-call axis
  const modules = Array.isArray(input) ? input : [input];
  const kilobytes = Math.round(modules.reduce((total, module) => total + module.length, 0) / 1024);
  for (const mode of MODES) {
    for (const emitter of ['babel', 'unplugin']) {
      const start = performance.now();
      let injected = 0;
      for (const module of modules) {
        const code = await transformWith(emitter, mode, module, ts);
        if (code && code.includes(INJECTION_MARK[mode])) injected++;
      }
      const seconds = (performance.now() - start) / 1000;
      const detected = injected >= injections;
      const ok = detected && seconds < bounds[mode][emitter];
      if (!ok) failed++;
      const size = modules.length > 1 ? `${ kilobytes }kb, ${ modules.length } modules` : `${ kilobytes }kb`;
      echo`${ ok ? green('PASS') : red('FAIL') } ${ cyan(name) } (${ size }) | ${ mode } ${ emitter }: ${ seconds.toFixed(2) }s (bound ${ bounds[mode][emitter] }s${ detected ? '' : `, ${ injected }/${ injections } INJECTED` })`;
    }
  }
}
if (failed) throw new Error('Some transpiler performance gates have failed');

import { vite, webpack, rollup, esbuild, rspack, rolldown, farm, bun, shouldTransform } from '@core-js/unplugin';
import type { Options, Method, Mode, Targets } from '@core-js/unplugin';

// shouldTransform is the identifier-filter exposed for consumer pre-filtering
const transformDecision: boolean = shouldTransform('/abs/path/to/source.js');
transformDecision;

// `null` accepted on all optional fields (mirrors the runtime conditional-spread idiom)
vite({
  method: 'usage-global',
  version: null,
  mode: null,
  package: null,
  additionalPackages: null,
  targets: null,
  include: null,
  exclude: null,
  debug: null,
  shouldInjectPolyfill: null,
  absoluteImports: null,
  configPath: null,
  browserslistEnv: null,
  ignoreBrowserslistConfig: null,
  shippedProposals: null,
  importStyle: null,
  phase: null,
});

// readonly arrays accepted for additionalPackages / include / exclude
const unpAdditional = ['@x/y'] as const;
const unpInclude = ['es.array.push'] as const;
const unpExclude = [/^web\./] as const;
vite({
  method: 'usage-global',
  additionalPackages: unpAdditional,
  include: unpInclude,
  exclude: unpExclude,
});
// Sub-entry imports (e.g., import plugin from '@core-js/unplugin/vite')
import vitePlugin from '@core-js/unplugin/vite';
import webpackPlugin from '@core-js/unplugin/webpack';
import rollupPlugin from '@core-js/unplugin/rollup';
import esbuildPlugin from '@core-js/unplugin/esbuild';
import rspackPlugin from '@core-js/unplugin/rspack';
import rolldownPlugin from '@core-js/unplugin/rolldown';
import farmPlugin from '@core-js/unplugin/farm';
import bunPlugin from '@core-js/unplugin/bun';

// exported bundler plugins exist
vite;
webpack;
rollup;
esbuild;
rspack;
rolldown;
farm;
bun;

// type exports
const method: Method = 'usage-global';
const mode: Mode = 'actual';
const targets: Targets = { chrome: '80' };
const opts: Options = { method: 'usage-global' };

// valid options
vite({ method: 'usage-global' });
vite({ method: 'usage-pure' });
vite({ method: 'entry-global' });

vite({ method: 'usage-global', version: '4.0' });
vite({ method: 'usage-global', version: 'node_modules' });
vite({ method: 'usage-global', version: 'package.json' });
vite({ method: 'usage-global', mode: 'actual' });
vite({ method: 'usage-global', mode: 'es' });
vite({ method: 'usage-global', mode: 'stable' });
vite({ method: 'usage-global', mode: 'full' });

vite({ method: 'usage-global', package: 'core-js' });
vite({ method: 'usage-pure', package: '@core-js/pure' });
vite({ method: 'usage-global', additionalPackages: ['my-core-js'] });

vite({ method: 'usage-global', targets: { chrome: '80' } });
vite({ method: 'usage-global', targets: { chrome: '80', firefox: 72 } });
vite({ method: 'usage-global', targets: '> 1%' });
vite({ method: 'usage-global', targets: ['defaults', 'not IE 11'] });

vite({ method: 'usage-global', include: ['es.array.push'] });
vite({ method: 'usage-global', include: ['es.array.push', /^es\.promise\./] });
vite({ method: 'usage-global', exclude: [/^es\.array\./] });

vite({ method: 'usage-global', debug: true });
vite({ method: 'usage-global', shouldInjectPolyfill: (name, shouldInject) => shouldInject });
vite({ method: 'usage-global', absoluteImports: true });
vite({ method: 'usage-global', configPath: '.' });
vite({ method: 'usage-global', ignoreBrowserslistConfig: true });
vite({ method: 'usage-global', shippedProposals: true });
vite({ method: 'usage-global', importStyle: 'import' });
vite({ method: 'usage-global', importStyle: 'require' });
vite({ method: 'usage-global', browserslistEnv: 'production' });

// phase opt: usage-* allow pre/post/pre+post; entry-global allows only pre
vite({ method: 'usage-global', phase: 'pre' });
vite({ method: 'usage-pure', phase: 'post' });
vite({ method: 'usage-global', phase: 'pre+post' });
vite({ method: 'entry-global', phase: 'pre' });

// all options combined
vite({
  method: 'usage-global',
  version: '4.0',
  mode: 'actual',
  package: 'my-core-js',
  additionalPackages: ['@x/y'],
  targets: { chrome: '80' },
  include: ['es.array.push'],
  exclude: [/^web\./],
  debug: true,
  shouldInjectPolyfill: (name, shouldInject) => shouldInject,
  absoluteImports: false,
  configPath: '.',
  ignoreBrowserslistConfig: false,
  shippedProposals: true,
  importStyle: 'import',
});

// all bundler-specific exports accept same options
webpack({ method: 'usage-global' });
rollup({ method: 'usage-global' });
esbuild({ method: 'usage-global' });
rspack({ method: 'usage-global' });
rolldown({ method: 'usage-global' });
farm({ method: 'usage-global' });
bun({ method: 'usage-global' });

// sub-entry default imports accept same options
vitePlugin({ method: 'usage-global' });
webpackPlugin({ method: 'usage-pure' });
rollupPlugin({ method: 'entry-global' });
esbuildPlugin({ method: 'usage-global' });
rspackPlugin({ method: 'usage-global' });
rolldownPlugin({ method: 'usage-global' });
farmPlugin({ method: 'usage-global' });
bunPlugin({ method: 'usage-global' });

// @ts-expect-error — method is required
vite({});
// @ts-expect-error — invalid method
vite({ method: 'invalid' });
// @ts-expect-error — invalid mode
vite({ method: 'usage-global', mode: 'invalid' });
// @ts-expect-error — version must be a string
vite({ method: 'usage-global', version: 4 });
// @ts-expect-error — debug must be a boolean
vite({ method: 'usage-global', debug: 'yes' });
// @ts-expect-error — package must be a string
vite({ method: 'usage-global', package: 123 });
// @ts-expect-error — additionalPackages must be a string array
vite({ method: 'usage-global', additionalPackages: [123] });
// @ts-expect-error — include must be an array
vite({ method: 'usage-global', include: 'es.array.push' });
// @ts-expect-error — shouldInjectPolyfill must be a function
vite({ method: 'usage-global', shouldInjectPolyfill: true });
// @ts-expect-error — importStyle must be 'import' or 'require'
vite({ method: 'usage-global', importStyle: 'esm' });
// @ts-expect-error — absoluteImports must be a boolean
vite({ method: 'usage-global', absoluteImports: 'path' });
// @ts-expect-error — configPath must be a string
vite({ method: 'usage-global', configPath: true });
// @ts-expect-error — shippedProposals must be a boolean
vite({ method: 'usage-global', shippedProposals: 'yes' });
// @ts-expect-error — browserslistEnv must be a string
vite({ method: 'usage-global', browserslistEnv: 1 });
// @ts-expect-error — entry-global rejects phase 'post' (discriminated union)
vite({ method: 'entry-global', phase: 'post' });
// @ts-expect-error — entry-global rejects phase 'pre+post'
vite({ method: 'entry-global', phase: 'pre+post' });
// @ts-expect-error — invalid phase value
vite({ method: 'usage-global', phase: 'late' });

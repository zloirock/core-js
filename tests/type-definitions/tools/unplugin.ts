import { vite, webpack, rollup, esbuild, rspack, rolldown } from '@core-js/unplugin';
import type { Options, Method, Mode } from '@core-js/unplugin';
// Sub-entry imports (e.g., import plugin from '@core-js/unplugin/vite')
import vitePlugin from '@core-js/unplugin/vite';
import webpackPlugin from '@core-js/unplugin/webpack';
import rollupPlugin from '@core-js/unplugin/rollup';
import esbuildPlugin from '@core-js/unplugin/esbuild';
import rspackPlugin from '@core-js/unplugin/rspack';
import rolldownPlugin from '@core-js/unplugin/rolldown';

// exported bundler plugins exist
vite;
webpack;
rollup;
esbuild;
rspack;
rolldown;

// type exports
const method: Method = 'usage-global';
const mode: Mode = 'actual';
const opts: Options = { method: 'usage-global' };

// valid options
vite({ method: 'usage-global' });
vite({ method: 'usage-pure' });
vite({ method: 'entry-global' });

vite({ method: 'usage-global', version: '4.0' });
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

// sub-entry default imports accept same options
vitePlugin({ method: 'usage-global' });
webpackPlugin({ method: 'usage-pure' });
rollupPlugin({ method: 'entry-global' });
esbuildPlugin({ method: 'usage-global' });
rspackPlugin({ method: 'usage-global' });
rolldownPlugin({ method: 'usage-global' });

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

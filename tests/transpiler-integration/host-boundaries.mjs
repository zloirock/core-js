// Exercise the host's loader and module rules, not only transformInclude in isolation.
import { strict as assert } from 'node:assert';
import { mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import unplugin from '../../packages/core-js-unplugin/index.js';

const root = resolve(import.meta.dirname, '../..');
const aliases = {
  'core-js': join(root, 'packages/core-js'),
  '@core-js/pure': join(root, 'packages/core-js-pure'),
};
const methods = ['entry-global', 'usage-global', 'usage-pure'];
function opts(method) {
  return { method, version: '4.0', mode: 'full', targets: { ie: 11 } };
}
function source(method) {
  return `${ method === 'entry-global' ? 'import "core-js/actual/array/at";' : '' }globalThis.result = [3].at(0);`;
}

function verify(code, value = 3, stripped = true) {
  const context = {};
  runInNewContext(`${ stripped ? 'Array.prototype.at = undefined;' : '' }\n${ code }`, context);
  assert.equal(context.result, value);
}

export async function hostBoundaries(run) {
  const dir = await realpath(await mkdtemp(join(tmpdir(), 'core-js-host-')));
  try {
    const esbuild = await import('esbuild');
    await run('esbuild declining parse leaves the next loader', async () => {
      const file = join(dir, 'unparsed.js');
      await writeFile(file, 'const number: number = 3;');
      const context = await esbuild.context({
        entryPoints: [file], bundle: true, write: false, format: 'iife',
        plugins: [unplugin.esbuild(opts('usage-pure')), {
          name: 'typed-owner',
          setup(build) {
            build.onLoad({ filter: /unparsed\.js$/, namespace: 'file' }, () => ({ contents: 'globalThis.result = 3;', loader: 'js' }));
          },
        }], logLevel: 'silent',
      });
      try {
        const first = await context.rebuild();
        verify(first.outputFiles[0].text);
        assert.ok(first.warnings.some(warning => warning.text.includes('core-js')));
        await writeFile(file, 'const number = 3;');
        const second = await context.rebuild();
        verify(second.outputFiles[0].text);
        assert.equal(second.warnings.length, 0);
      } finally {
        await context.dispose();
      }
    });
    await run('esbuild non-code loader preserves text', async () => {
      const file = join(dir, 'text.js');
      const text = '[3].at(0)';
      await writeFile(file, text);
      const result = await esbuild.build({
        stdin: { contents: 'import text from "./text.js"; globalThis.result = text;', resolveDir: dir },
        bundle: true, write: false, format: 'iife', loader: { '.js': 'text' },
        plugins: [unplugin.esbuild(opts('usage-pure'))], logLevel: 'silent',
      });
      verify(result.outputFiles[0].text, text);
    });
    for (const method of methods) {
      for (const used of [false, true]) await run(`esbuild loader/${ method }/${ used }`, async () => {
        const file = join(dir, 'view.js');
        await writeFile(file, `const el = <view />; ${ used ? source(method) : 'globalThis.result = el;' }`);
        const result = await esbuild.build({
          entryPoints: [file], bundle: true, write: false, format: 'iife', alias: aliases,
          loader: { '.js': 'jsx' }, jsxFactory: 'view', banner: { js: 'function view() { return 3; }' },
          plugins: [unplugin.esbuild(opts(method))], logLevel: 'silent',
        });
        verify(result.outputFiles[0].text);
      });
      await run(`esbuild foreign namespace/${ method }`, async () => {
        const result = await esbuild.build({
          entryPoints: ['virtual.js'], bundle: true, write: false, format: 'iife',
          plugins: [unplugin.esbuild(opts(method)), {
            name: 'virtual-owner',
            setup(build) {
              build.onResolve({ filter: /^virtual\.js$/ }, () => ({ path: 'virtual.js', namespace: 'owned' }));
              build.onLoad({ filter: /.*/, namespace: 'owned' }, () => ({ contents: 'globalThis.result = 3;', loader: 'js' }));
            },
          }], logLevel: 'silent',
        });
        verify(result.outputFiles[0].text);
      });
      await run(`esbuild typed loader and map/${ method }`, async () => {
        const file = join(dir, 'typed.js');
        const input = `const number: number = 3; ${ source(method).replace('[3]', '[number]') }`;
        await writeFile(file, input);
        const result = await esbuild.build({
          entryPoints: [file], bundle: true, write: false, format: 'iife', alias: aliases,
          loader: { '.js': 'ts' }, sourcemap: 'external', outfile: join(dir, 'typed-output.js'),
          plugins: [unplugin.esbuild(opts(method))], logLevel: 'silent',
        });
        verify(result.outputFiles.find(output => output.path.endsWith('.js')).text);
        const map = JSON.parse(result.outputFiles.find(output => output.path.endsWith('.map')).text);
        assert.ok(map.sourcesContent.includes(input));
      });
      for (const phase of method === 'entry-global' ? ['pre'] : ['pre', 'post', 'pre+post']) {
        await run(`esbuild raw component/${ method }/${ phase }`, async () => {
          const file = join(dir, 'view.vue');
          await writeFile(file, '<template><div /></template>');
          const result = await esbuild.build({
            entryPoints: [file], bundle: true, write: false, format: 'iife',
            plugins: [unplugin.esbuild({ ...opts(method), phase }), {
              name: 'component-owner',
              setup(build) {
                build.onLoad({ filter: /\.vue$/, namespace: 'file' }, () => ({ contents: 'globalThis.result = 3;', loader: 'js' }));
              },
            }], logLevel: 'silent',
          });
          verify(result.outputFiles[0].text);
        });
      }
    }
    const { createServer } = await import('vite');
    for (const method of ['usage-global', 'usage-pure']) await run(`vite optimized dependencies/${ method }`, async () => {
      const cacheDir = join(dir, 'custom-cache');
      const server = await createServer({
        root: dir, cacheDir, configFile: false, logLevel: 'silent',
        plugins: [unplugin.vite(opts(method))], resolve: { alias: aliases },
        server: { watch: null, middlewareMode: true },
        optimizeDeps: { noDiscovery: true, include: ['@core-js/pure/actual/instance/at'] },
      });
      try {
        const environment = server.environments.client;
        await environment.depsOptimizer.init();
        const pending = Object.values(environment.depsOptimizer.metadata.discovered);
        environment.depsOptimizer.run();
        await Promise.all(pending.map(info => info.processing));
        const info = environment.depsOptimizer.metadata.optimized['@core-js/pure/actual/instance/at'];
        assert.ok(info);
        const original = await readFile(info.file, 'utf8');
        const cached = await server.transformRequest(`/@fs/${ environment.depsOptimizer.getOptimizedDepId(info) }`);
        // Vite may append its own HMR/footer text; the polyfill's existing code stays verbatim.
        assert.ok(cached.code.startsWith(original.trimEnd()));
        const code = 'export const value = [3].at(0);';
        await writeFile(join(dir, 'custom-cache-user.js'), code);
        const user = await server.transformRequest('/custom-cache-user.js');
        assert.ok(user.code.includes('core-js'));
      } finally {
        await server.close();
      }
    });
    for (const host of ['webpack', 'rspack']) {
      const mod = await import(host === 'webpack' ? 'webpack' : '@rspack/core');
      const factory = mod.default ?? mod.rspack;
      async function bundle(method, code, rule = {}, noParse = undefined, entry = 'globalThis.result = require("./lib.js").result;') {
        await writeFile(join(dir, 'lib.js'), code);
        await writeFile(join(dir, 'entry.js'), entry);
        const compiler = factory({
          mode: 'development', devtool: false, context: dir, entry: './entry.js', target: 'web',
          output: { path: join(dir, 'out'), filename: 'bundle.js' },
          resolve: { alias: aliases },
          module: { rules: [{ test: /lib\.js$/, ...rule }], ...noParse ? { noParse } : {} },
          plugins: [unplugin[host](opts(method))],
        });
        try {
          const stats = await new Promise((resolveResult, reject) => compiler.run((error, value) => error ? reject(error) : resolveResult(value)));
          assert.equal(stats.hasErrors(), false, stats.toString({ all: false, errors: true }));
          return await readFile(join(dir, 'out/bundle.js'), 'utf8');
        } finally {
          await new Promise((resolveResult, reject) => compiler.close(error => error ? reject(error) : resolveResult()));
        }
      }
      for (const method of ['usage-global', 'usage-pure']) {
        for (const strict of [false, true]) await run(`${ host } auto strictness/${ method }/${ strict }`, async () => {
          const fn = `function () {
            ${ strict ? "'use strict';" : '' }
            try {
              switch (typeof Iterator.zip) {
                case 'function': function Iterator() { return 'local'; } return Iterator();
              }
              return 'none';
            } catch (error) { return error.name; }
          }`;
          const native = runInNewContext(`(${ fn })()`, { Iterator: { zip() { throw new Error('The discriminant must not call zip'); } } });
          assert.equal(native, strict ? 'local' : 'TypeError');
          verify(await bundle(method, `this.result = (${ fn })();`, { type: 'javascript/auto' }), native);
        });
        for (const type of ['javascript/auto', 'javascript/dynamic']) await run(`${ host } ${ type }/${ method }`, async () => {
          verify(await bundle(method, 'this.result = [3].at(0);', { type }));
        });
        await run(`${ host } javascript/esm/${ method }`, async () => {
          verify(await bundle(method, 'export const result = typeof module === "undefined" ? [3].at(0) : 0;', { type: 'javascript/esm' }));
        });
        await run(`${ host } asset source/${ method }`, async () => {
          const text = 'this.result = [3].at(0);';
          const code = await bundle(method, text, { type: 'asset/source' }, undefined, 'globalThis.result = require("./lib.js");');
          verify(code, text, false);
        });
        for (const noParse of [/lib\.js$/, value => value.endsWith('lib.js'), [join(dir, 'lib.js')]]) {
          await run(`${ host } noParse/${ method }/${ typeof noParse }`, async () => {
            verify(await bundle(method, 'this.result = [3].at(0);', {}, noParse), 3, false);
          });
        }
      }
    }
    const { rollup } = await import('rollup');
    const { nodeResolve } = await import('@rollup/plugin-node-resolve');
    const { default: commonjs } = await import('@rollup/plugin-commonjs');
    for (const method of methods) for (const ext of ['vue', 'svelte', 'astro', 'md', 'mdx', 'svx', 'gjs', 'gts']) {
      await run(`compiled default/${ method }/${ ext }`, async () => {
        const file = join(dir, `view.${ ext }`);
        await writeFile(file, '<raw component>');
        const build = await rollup({
          input: file,
          plugins: [unplugin.rollup(opts(method)), {
            name: 'component-compiler',
            resolveId(id) {
              for (const [pkg, path] of Object.entries(aliases)) if (id.startsWith(`${ pkg }/`)) return `${ path }/${ id.slice(pkg.length + 1) }.js`;
              return null;
            },
            transform(code, id) { return id === file ? source(method) : null; },
          }, nodeResolve(), commonjs()],
        });
        try {
          const result = await build.generate({ format: 'iife' });
          verify(result.output[0].code);
        } finally {
          await build.close();
        }
      });
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}


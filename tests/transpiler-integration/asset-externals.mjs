// Asset discovery and external loading belong to the real host's dependency graph.
import { strict as assert } from 'node:assert';
import { createRequire } from 'node:module';
import { mkdtemp, mkdir, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve as resolvePath } from 'node:path';
import { pathToFileURL } from 'node:url';
import unplugin from '../../packages/core-js-unplugin/index.js';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';

const root = resolvePath(import.meta.dirname, '../..');
const require = createRequire(import.meta.url);
const aliases = { 'core-js': join(root, 'packages/core-js'), '@core-js/pure': join(root, 'packages/core-js-pure') };
function options(method) {
  return { method, version: '4.0', mode: 'full', targets: { ie: 11 } };
}
const external = /^(?:@core-js\/pure|core-js)(?:\/|$)/;
const banner = 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);';

async function compileWebpack(compiler) {
  try {
    await new Promise((resolve, reject) => compiler.run((error, stats) => {
      if (error) reject(error);
      else if (stats.hasErrors()) reject(new Error(stats.toString({ all: false, errors: true })));
      else resolve();
    }));
  } finally {
    await new Promise((resolve, reject) => compiler.close(error => error ? reject(error) : resolve()));
  }
}

export async function assetExternals(run) {
  const dir = await realpath(await mkdtemp(join(tmpdir(), 'core-js-asset-externals-')));
  await symlink(join(root, 'node_modules'), join(dir, 'node_modules'), 'dir');
  try {
    const esbuild = await import('esbuild');
    const rolldown = await import('rolldown');
    const vite = await import('vite');
    const { transformAsync } = require('@babel/core');
    const compilers = { webpack: require('webpack'), rspack: require('@rspack/core') };
    await writeFile(join(dir, 'legacy.cjs'), 'module.exports = xs => xs.at(-1);');
    await writeFile(join(dir, 'entry.mjs'), 'import read from "./legacy.cjs"; export const r = read([1, 2]); export const effects = [];');
    for (const host of ['esbuild', 'rolldown', 'vite', 'webpack', 'rspack']) {
      for (const method of ['usage-global', 'usage-pure']) {
        for (const compatible of [false, true]) {
          await run(`${ host }/${ method }/external CJS in ESM/${ compatible ? 'loader' : 'refused' }`, async () => {
            const out = join(dir, `${ host }-${ method }-${ compatible }`);
            await mkdir(out);
            const file = join(out, 'out.mjs');
            async function build() {
              if (host === 'esbuild') return esbuild.build({
                entryPoints: [join(dir, 'entry.mjs')], bundle: true, outfile: file, format: 'esm', platform: 'node',
                packages: 'external', banner: compatible ? { js: banner } : undefined,
                plugins: [unplugin.esbuild(options(method))], logLevel: 'silent',
              });
              if (host === 'rolldown') {
                const bundle = await rolldown.rolldown({
                  input: join(dir, 'entry.mjs'), external: id => external.test(id),
                  platform: compatible ? 'node' : 'neutral', plugins: [unplugin.rolldown(options(method))],
                });
                try {
                  return await bundle.write({ file, format: 'es' });
                } finally {
                  await bundle.close();
                }
              }
              if (host === 'vite') return vite.build({
                root: dir, configFile: false, logLevel: 'silent', plugins: [unplugin.vite(options(method))],
                build: { outDir: out, minify: false, lib: { entry: join(dir, 'entry.mjs'), formats: ['es'], fileName: () => 'out.mjs' },
                  rolldownOptions: { external: id => external.test(id) || compatible && id.startsWith('node:'), platform: compatible ? 'node' : 'neutral' } },
              });
              return compileWebpack(compilers[host]({
                mode: 'development', devtool: false, entry: join(dir, 'entry.mjs'), target: 'node',
                experiments: { outputModule: true }, externals: [external],
                externalsType: compatible ? 'node-commonjs' : 'import',
                output: { path: out, filename: 'out.mjs', module: true, library: { type: 'module' } },
                plugins: [unplugin[host](options(method))],
              }));
            }
            if (!compatible) await assert.rejects(build, /\[core-js\].*injected require.*Bundle the core-js dependency/s);
            else {
              await build();
              assert.equal(await runInWorker(file), 'OK|2|[]');
            }
          });
        }
      }
    }
    for (const host of ['webpack', 'rspack']) for (const method of ['usage-global', 'usage-pure']) {
      for (const member of [false, true]) await run(`${ host }/${ method }/external namespace/${ member ? 'default' : 'whole' }`, async () => {
        const out = join(dir, `${ host }-${ method }-namespace-${ member }`);
        const compiler = compilers[host]({
          mode: 'development', devtool: false, entry: join(dir, 'entry.mjs'), target: 'node',
          experiments: { outputModule: true }, externalsType: 'module',
          // eslint-disable-next-line promise/prefer-await-to-callbacks -- webpack and rspack external resolver protocol
          externals: [({ request }, callback) => callback(null, external.test(request)
            ? member && method === 'usage-pure' ? [request, 'default'] : request : undefined)],
          output: { path: out, filename: 'out.mjs', module: true, library: { type: 'module' } },
          plugins: [unplugin[host]({ ...options(method), phase: 'pre+post' })],
        });
        if (method === 'usage-pure' && !member) await assert.rejects(() => compileWebpack(compiler), /\[core-js\].*injected require/s);
        else {
          await compileWebpack(compiler);
          assert.equal(await runInWorker(join(out, 'out.mjs')), 'OK|2|[]');
        }
      });
    }
    for (const host of ['webpack', 'vite']) for (const leg of ['babel', 'unplugin']) {
      await run(`${ host }/${ leg }/asset and worker URL discovery`, async () => {
        const input = join(dir, `assets-${ host }-${ leg }`);
        const out = join(input, 'dist');
        await mkdir(input);
        await writeFile(join(input, 'logo.svg'), '<svg xmlns="http://www.w3.org/2000/svg"><text>asset-marker</text></svg>');
        await writeFile(join(input, 'worker.js'), 'postMessage("worker-marker");');
        let code = 'export const asset = new URL(`./logo.svg`, import.meta.url);\n'
          + 'export const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });';
        const opts = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
        if (leg === 'babel') ({ code } = await transformAsync(code, {
          configFile: false, babelrc: false, filename: join(input, 'entry.mjs'), plugins: [[babelPlugin, opts]],
        }));
        const entry = join(input, 'entry.mjs');
        await writeFile(entry, code);
        let files;
        if (host === 'vite') {
          const result = await vite.build({
            root: input, configFile: false, logLevel: 'silent', base: './',
            resolve: { alias: aliases }, plugins: leg === 'unplugin' ? [unplugin.vite(opts)] : [],
            build: { outDir: out, minify: false, assetsInlineLimit: 0, rolldownOptions: { input: entry } },
          });
          files = (Array.isArray(result) ? result : [result]).flatMap(build => build.output);
        } else {
          const compiler = require('webpack')({
            mode: 'development', devtool: false, entry, resolve: { alias: aliases },
            experiments: { outputModule: true }, output: { path: out, filename: 'out.mjs', module: true, library: { type: 'module' } },
            plugins: leg === 'unplugin' ? [unplugin.webpack(opts)] : [],
          });
          compiler.hooks.done.tap('asset-result', stats => {
            files = stats.compilation.getAssets().map(asset => ({ fileName: asset.name }));
          });
          await compileWebpack(compiler);
        }
        assert.ok(files.some(file => file.fileName.endsWith('.svg')), 'the asset is emitted');
        const text = await Promise.all(files.map(file => readFile(join(out, file.fileName), 'utf8')));
        assert.ok(text.some(contents => contents.includes('asset-marker')), 'the emitted asset is the source asset');
        assert.ok(text.some(contents => contents.includes('worker-marker')), 'the emitted worker is the source worker');
        assert.ok(text.every(contents => !contents.includes(pathToFileURL(input).href)), 'no build-machine URL leaks into the bundle');
      });
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

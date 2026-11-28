// Asset discovery and external loading belong to the real host's dependency graph.
import { strict as assert } from 'node:assert';
import { createRequire } from 'node:module';
import { mkdir, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { join, resolve as resolvePath } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { runInNewContext } from 'node:vm';
import unplugin from '../../packages/core-js-unplugin/index.js';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import { withCleanup, withTmpDir } from './runtime.mjs';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';

const root = resolvePath(import.meta.dirname, '../..');
const require = createRequire(import.meta.url);
const aliases = { 'core-js': join(root, 'packages/core-js'), '@core-js/pure': join(root, 'packages/core-js-pure') };
function options(method) {
  return { method, version: '4.0', mode: 'full', targets: { ie: 11 } };
}
const external = /^(?:@core-js\/pure|core-js)(?:\/|$)/;
const banner = 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);';
const externalRequireMessage = /\[core-js\].*injected require.*Bundle the core-js dependency/s;

function onlyEsbuildRequireErrors(error) {
  const errors = error?.errors;
  return Array.isArray(errors) && errors.length > 0
    && errors.every(entry => entry?.pluginName === 'core-js-unplugin:pre' && externalRequireMessage.test(entry.text));
}

class CompilationError extends AggregateError {
  name = 'CompilationError';
}

async function compileWebpack(compiler) {
  return withCleanup(async () => {
    const stats = await promisify(compiler.run.bind(compiler))();
    if (stats.hasErrors()) throw new CompilationError(stats.compilation.errors, stats.toString({ all: false, errors: true }));
    return stats;
  }, () => promisify(compiler.close.bind(compiler))());
}

function expectedBuildError(pattern, compiler = false) {
  return error => compiler
    ? error instanceof CompilationError && error.errors.length > 0 && error.errors.every(({ message }) => pattern.test(message))
    : !(error instanceof AggregateError) && pattern.test(error.message);
}

export async function assetExternals(run) {
  await run('webpack expected compilation error is the only failure', async () => {
    const refusal = new Error('[core-js] injected require');
    const unrelated = new Error('unrelated compilation error');
    const accepts = expectedBuildError(/\[core-js\].*injected require/su, true);
    function compile(errors, closeError) {
      return compileWebpack({
        /* eslint-disable promise/prefer-await-to-callbacks -- exercise webpack's callback protocol */
        run(callback) {
          callback(null, { hasErrors: () => errors.length !== 0, compilation: { errors }, toString: () => refusal.message });
        },
        close(callback) { callback(closeError); },
        /* eslint-enable promise/prefer-await-to-callbacks -- end of the mock compiler */
      });
    }
    await assert.rejects(() => compile([refusal]), accepts);
    await assert.rejects(() => compile([refusal, refusal]), accepts);
    for (const [errors, closeError] of [[[unrelated]], [[refusal, unrelated]], [[], refusal], [[refusal], unrelated]]) {
      await assert.rejects(() => assert.rejects(() => compile(errors, closeError), accepts), { name: 'AssertionError' });
    }
  });
  await withTmpDir(async temp => {
    const dir = await realpath(temp);
    await symlink(join(root, 'node_modules'), join(dir, 'node_modules'), 'dir');
    const esbuild = await import('esbuild');
    const rolldown = await import('rolldown');
    const vite = await import('vite');
    const { transformAsync } = require('@babel/core');
    const compilers = { webpack: require('webpack'), rspack: require('@rspack/core') };
    await writeFile(join(dir, 'legacy.cjs'), 'module.exports = xs => xs.at(-1);');
    await writeFile(join(dir, 'entry.mjs'), 'import read from "./legacy.cjs"; export const r = read([1, 2]); export const effects = [];');
    const modules = ['es.object.to-string', 'es.array.from', 'es.string.iterator'];
    const fixture = join(root, 'tests/transpiler-fixtures/entry-global/audit-entry-optional-call-require/input.mjs');
    const optionalEntry = await readFile(fixture, 'utf8');
    const entryOptions = options('entry-global');
    async function babelEntry(input, opts) {
      return (await transformAsync(input, { filename: fixture, configFile: false, babelrc: false, plugins: [[babelPlugin, opts]] })).code;
    }
    await run('esbuild/optional entry preserves the host loader', async () => {
      const input = join(dir, 'optional.cjs');
      const buildOptions = { entryPoints: [input], bundle: true, platform: 'browser', format: 'iife', write: false, metafile: true, logLevel: 'silent' };
      // The original call establishes whether this esbuild links optional dependencies in a browser build.
      let linksOptional;
      for (const adapter of ['source', 'babel', 'unplugin']) for (const kind of ['optional', 'required', 'filtered']) {
        if (adapter === 'source' && kind === 'filtered') continue;
        const source = kind === 'required' ? optionalEntry.replace('require?.(', 'require(') : optionalEntry;
        const opts = kind === 'filtered' ? { ...entryOptions, exclude: modules } : entryOptions;
        await writeFile(input, adapter === 'babel' ? await babelEntry(source, opts) : source);
        const plugins = adapter === 'unplugin' ? [unplugin.esbuild(opts)] : [];
        const { metafile, outputFiles } = await esbuild.build({ ...buildOptions, plugins });
        const inputs = Object.keys(metafile.inputs);
        function linked(name) { return inputs.some(id => id.endsWith(`/modules/${ name }.js`)); }
        if (adapter === 'source' && kind === 'optional') linksOptional = linked('es.array.from');
        const bundled = kind === 'required' || kind === 'optional' && linksOptional;
        for (const name of modules) assert.equal(linked(name), bundled, `${ adapter }/${ kind }/${ name }`);
        const code = `delete Array.from;\n${ outputFiles[0].text }\nArray.from?.([7])?.[0]`;
        const calls = [];
        assert.equal(runInNewContext(code, { require: id => calls.push(id) }), bundled ? 7 : undefined);
        const delegated = adapter === 'source' ? ['core-js/actual/array/from'] : modules.map(name => `core-js/modules/${ name }`);
        assert.deepEqual(calls, kind === 'optional' && !bundled ? delegated : []);
        assert.equal(runInNewContext(code, { require: null }), bundled ? 7 : undefined);
        if (kind === 'optional' && !bundled) assert.throws(() => runInNewContext(code), { name: 'ReferenceError' });
        if (adapter === 'unplugin' && kind !== 'filtered') {
          const externalOptions = { ...buildOptions, format: 'esm', external: ['core-js/*'], plugins };
          if (kind === 'required') await assert.rejects(() => esbuild.build(externalOptions), onlyEsbuildRequireErrors);
          else await esbuild.build(externalOptions);
        }
      }
    });
    await run('absolute ESM imports select the project installation', async () => {
      const project = join(dir, 'absolute-project');
      const nested = join(project, 'nested');
      const name = 'entry-package';
      const leaf = process.platform === 'win32' ? 'from#%.mjs' : 'from#%?.mjs';
      const manifest = JSON.stringify({ name, exports: { './actual/array/from': `./${ encodeURIComponent(leaf) }` } });
      for (const [base, value] of [[project, 17], [nested, 23]]) {
        const pkg = join(base, 'node_modules', name);
        await mkdir(pkg, { recursive: true });
        await writeFile(join(pkg, 'package.json'), manifest);
        await writeFile(join(pkg, leaf), `export default () => ${ value };`);
      }
      const entry = join(nested, 'app.mjs');
      const source = 'export const r = Array.from([3]); export const effects = [];';
      const opts = { ...options('usage-pure'), mode: 'actual', package: name, absoluteImports: true };
      const config = { filename: entry, babelrc: false, configFile: false, plugins: [[babelPlugin, opts]] };
      const cwd = process.cwd();
      try {
        process.chdir(project);
        await writeFile(entry, (await transformAsync(source, config)).code);
        assert.equal(await runInWorker(entry, { strip: true, stripGlobals: [] }), 'OK|17|[]');
        const outputs = new Map();
        for (const host of ['esbuild', 'rollup', 'webpack', 'rspack']) for (const adapter of ['author', 'babel', 'unplugin']) {
          if (adapter === 'author' && host !== 'esbuild') continue;
          const filename = `${ host }-${ adapter }.mjs`;
          const outfile = join(project, filename);
          let code = source;
          if (adapter === 'author') code = `import from from '${ name }/actual/array/from'; export const r = from([3]); export const effects = [];`;
          else if (adapter === 'babel') {
            const caller = { name: { rollup: '@rollup/plugin-babel', webpack: 'babel-loader' }[host] ?? host };
            ({ code } = await transformAsync(source, { ...config, caller }));
          }
          await writeFile(entry, code);
          const plugins = adapter === 'unplugin' ? [unplugin[host](opts)] : [];
          if (host === 'esbuild') await esbuild.build({ entryPoints: [entry], outfile, bundle: true, platform: 'browser', format: 'esm', plugins });
          else if (host === 'rollup') {
            const bundle = await require('rollup').rollup({ input: entry, plugins });
            try {
              await bundle.write({ file: outfile, format: 'es' });
            } finally {
              await bundle.close();
            }
          } else await compileWebpack(compilers[host]({
            mode: 'development', devtool: false, target: 'web', entry, plugins, experiments: { outputModule: true },
            output: { path: project, filename, module: true, library: { type: 'module' } },
          }));
          outputs.set(outfile, adapter === 'author' ? 23 : 17);
        }
        await rm(join(project, 'node_modules'), { recursive: true });
        await rm(join(nested, 'node_modules'), { recursive: true });
        for (const [outfile, value] of outputs) {
          assert.equal(await runInWorker(outfile, { strip: true, stripGlobals: [] }), `OK|${ value }|[]`, outfile);
        }
      } finally {
        process.chdir(cwd);
      }
    });
    await run('esbuild/late external entry uses dynamic imports', async () => {
      const input = join(dir, 'late-entry.mjs');
      const outfile = join(dir, 'late-external.mjs');
      await writeFile(input, `export const effects = [typeof Array.from]; await import('core-js/actual/array/from');
        export const r = Array.from([7])[0];`);
      const result = await esbuild.build({ entryPoints: [input], outfile, bundle: true, platform: 'node', format: 'esm',
        metafile: true, external: ['core-js/*'], plugins: [unplugin.esbuild(entryOptions)] });
      const [{ imports }] = Object.values(result.metafile.outputs);
      assert.deepEqual(imports.map(({ kind, path }) => [kind, path]), modules.map(name => ['dynamic-import', `core-js/modules/${ name }`]));
      assert.equal(await runInWorker(outfile, { strip: true, stripGlobals: [] }), 'OK|7|["undefined"]');
    });
    for (const host of ['webpack', 'rspack']) for (const filtered of [false, true]) {
      await run(`${ host }/Babel optional entry/${ filtered ? 'filtered' : 'linked' }`, async () => {
        const code = await babelEntry(optionalEntry, filtered ? { ...entryOptions, exclude: modules } : entryOptions);
        const read = filtered ? 'typeof Array.from' : 'Array.from([7])[0]';
        const filename = `babel-optional-${ host }.mjs`;
        const entry = join(dir, 'babel-optional-entry.mjs');
        await writeFile(join(dir, 'babel-optional.cjs'), `${ code }\nmodule.exports = ${ read };`);
        await writeFile(entry, 'export { default as r } from "./babel-optional.cjs"; export const effects = [];');
        const stats = await compileWebpack(compilers[host]({
          mode: 'development', devtool: false, target: 'web', entry, experiments: { outputModule: true },
          output: { path: dir, filename, module: true, library: { type: 'module' } },
        }));
        assert.doesNotMatch(stats.toString({ all: false, warnings: true }), /Critical dependency: require function/);
        assert.equal(await runInWorker(join(dir, filename), { strip: true, stripGlobals: [] }), filtered ? 'OK|"undefined"|[]' : 'OK|7|[]');
      });
    }
    for (const scenario of ['refused', 'loader', 'mixed errors']) {
      await run(`esbuild/implicit neutral ESM/file namespace/${ scenario }`, async () => {
        const file = join(dir, 'neutral.mjs');
        function compile() {
          return esbuild.build({
            entryPoints: [join(dir, 'entry.mjs')], bundle: true, platform: 'neutral', outfile: file, logLevel: 'silent',
            banner: scenario === 'loader' ? { js: 'import { createRequire } from "node:module"; const { load: require } = { load: createRequire(import.meta.url) };' } : undefined,
            plugins: [unplugin.esbuild(options('usage-pure')), { name: 'external-from-file', setup(build) {
              build.onResolve({ filter: external, namespace: 'file' }, ({ path }) => ({ path, external: true }));
              if (scenario === 'mixed errors') build.onEnd(() => ({ errors: [{ text: 'independent onEnd failure' }] }));
            } }],
          });
        }
        if (scenario === 'refused') await assert.rejects(compile, onlyEsbuildRequireErrors);
        else if (scenario === 'mixed errors') await assert.rejects(compile, error => {
          const diagnostics = error.errors.map(entry => onlyEsbuildRequireErrors({ errors: [entry] })
            ? 'core-js refusal' : `${ entry.pluginName }: ${ entry.text }`);
          assert.deepEqual(diagnostics.sort(), ['core-js refusal', 'external-from-file: independent onEnd failure']);
          return !onlyEsbuildRequireErrors(error);
        });
        else {
          await compile();
          assert.equal(await runInWorker(file, { strip: true, stripGlobals: [] }), 'OK|2|[]');
        }
      });
    }
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
                return withCleanup(() => bundle.write({ file, format: 'es' }), () => bundle.close());
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
            if (!compatible) {
              const accepts = host === 'esbuild' ? onlyEsbuildRequireErrors
                : expectedBuildError(externalRequireMessage, Object.hasOwn(compilers, host));
              await assert.rejects(build, accepts);
            } else {
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
        if (method === 'usage-pure' && !member) {
          await assert.rejects(() => compileWebpack(compiler), expectedBuildError(/\[core-js\].*injected require/su, true));
        } else {
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
  }, 'core-js-asset-externals-');
}

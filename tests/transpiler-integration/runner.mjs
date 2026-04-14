import { deepStrictEqual } from 'node:assert';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { mkdtemp, readFile, rm, writeFile } = fs;
const { dirname, join, resolve } = path;

const testDir = dirname(fileURLToPath(import.meta.url));
const unpluginPath = resolve(testDir, '../../packages/core-js-unplugin/index.js');
const methods = ['entry-global', 'usage-global', 'usage-pure'];
const inputOf = method => resolve(testDir, `input-${ method }.js`);
const pluginOpts = method => ({ method, version: '4.0', mode: 'full' });

const expected = {
  filterReject: [2, 4],
  uniqueBy: [1, 2, 3],
  setFrom: 3,
  cooked: 'hello',
};

// --- helpers ---

async function withTmpDir(fn) {
  const dir = await mkdtemp(join(os.tmpdir(), 'transpiler-test-'));
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// node verifier: import bundle, extract results, compare against expected
async function verifyInNode(code, label, ext = '.mjs') {
  await withTmpDir(async dir => {
    const file = join(dir, `bundle${ ext }`);
    await writeFile(file, code);
    const mod = await import(pathToFileURL(file).href);
    const results = mod.results ?? mod.default?.results ?? mod.default ?? mod;
    deepStrictEqual(Array.from(results.filterReject), expected.filterReject, `${ label }: filterReject`);
    deepStrictEqual(Array.from(results.uniqueBy), expected.uniqueBy, `${ label }: uniqueBy`);
    deepStrictEqual(results.setFrom, expected.setFrom, `${ label }: setFrom`);
    deepStrictEqual(results.cooked, expected.cooked, `${ label }: cooked`);
  });
}

// bun-mode output mixes CJS/ESM and isn't loadable by node — verify inside bun instead.
// usage-pure exports results; global methods patch globals.
async function verifyInBun(code, label, method) {
  await withTmpDir(async dir => {
    const bundle = join(dir, 'bundle.js');
    await writeFile(bundle, code);
    const script = join(dir, 'verify.mjs');
    const url = JSON.stringify(pathToFileURL(bundle).href);
    const exp = JSON.stringify(expected);
    const body = method === 'usage-pure' ? `
      const mod = await import(${ url });
      deepStrictEqual(Array.from(mod.filterReject), exp.filterReject);
      deepStrictEqual(Array.from(mod.uniqueBy), exp.uniqueBy);
      strictEqual(mod.setFrom, exp.setFrom);
      strictEqual(mod.cooked, exp.cooked);
    ` : `
      await import(${ url });
      deepStrictEqual([1,2,3,4].filterReject(x => x % 2), exp.filterReject);
      deepStrictEqual([1,2,3,2,1].uniqueBy(), exp.uniqueBy);
      strictEqual(Set.from([1,2,3]).size, exp.setFrom);
      strictEqual(String.cooked\`hello\`, exp.cooked);
    `;
    await writeFile(script, `
      import { deepStrictEqual, strictEqual } from 'node:assert';
      const exp = ${ exp };${ body }
    `);
    try {
      await $({ quiet: true })`bun ${ script }`;
    } catch (error) {
      throw new Error(`${ label }: ${ error.stderr || error.message }`);
    }
  });
}

async function esbuildBundle(stdinOrEntry) {
  const { build } = await import('esbuild');
  const result = await build({
    ...stdinOrEntry,
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'node',
  });
  return { code: result.outputFiles[0].text, ext: '.cjs' };
}

async function webpackLikeBundle(compiler, input, plugin) {
  return withTmpDir(async dir => {
    const filename = 'out.mjs';
    const instance = compiler({
      mode: 'production',
      devtool: false,
      entry: input,
      output: { path: dir, filename, module: true, library: { type: 'module' } },
      experiments: { outputModule: true },
      optimization: { minimize: false },
      plugins: [plugin],
    });
    try {
      const stats = await promisify(instance.run.bind(instance))();
      if (stats.hasErrors()) throw new Error(stats.compilation.errors[0].message);
    } finally {
      await promisify(instance.close.bind(instance))();
    }
    return { code: await readFile(join(dir, filename), 'utf8') };
  });
}

// --- builders ---
// each returns { code, ext?, verifier? }. verifier defaults to verifyInNode.

const unplugin = await import('@core-js/unplugin');
const pluginFor = name => (...args) => unplugin[name](...args);

const builders = {
  async babel(input, method) {
    const { transformAsync } = await import('@babel/core');
    const source = await readFile(input, 'utf8');
    const { code } = await transformAsync(source, {
      filename: input,
      plugins: [['@core-js', pluginOpts(method)]],
    });
    return esbuildBundle({ stdin: { contents: code, resolveDir: dirname(input), loader: 'js' } });
  },

  async esbuild(input, method) {
    return esbuildBundle({ entryPoints: [input], plugins: [pluginFor('esbuild')(pluginOpts(method))] });
  },

  async rollup(input, method) {
    const { rollup } = await import('rollup');
    const nodeResolve = (await import('@rollup/plugin-node-resolve')).default;
    const commonjs = (await import('@rollup/plugin-commonjs')).default;
    const bundle = await rollup({
      input,
      plugins: [pluginFor('rollup')(pluginOpts(method)), nodeResolve(), commonjs()],
    });
    const { output } = await bundle.generate({ format: 'es' });
    return { code: output[0].code };
  },

  async vite(input, method) {
    const { build } = await import('vite');
    const result = await build({
      root: testDir,
      logLevel: 'silent',
      build: {
        write: false,
        lib: { entry: input, formats: ['es'] },
        minify: false,
        commonjsOptions: { include: [/core-js/] },
      },
      resolve: { dedupe: ['core-js'] },
      plugins: [pluginFor('vite')(pluginOpts(method))],
    });
    const [{ output }] = Array.isArray(result) ? result : [result];
    return { code: output[0].code };
  },

  async webpack(input, method) {
    const wp = (await import('webpack')).default;
    return webpackLikeBundle(wp, input, pluginFor('webpack')(pluginOpts(method)));
  },

  async rspack(input, method) {
    const { rspack } = await import('@rspack/core');
    return webpackLikeBundle(rspack, input, pluginFor('rspack')(pluginOpts(method)));
  },

  async rolldown(input, method) {
    const { build } = await import('rolldown');
    return withTmpDir(async dir => {
      const file = join(dir, 'out.mjs');
      await build({
        input,
        platform: 'node',
        treeshake: false,
        plugins: [pluginFor('rolldown')(pluginOpts(method))],
        output: { format: 'esm', file, externalLiveBindings: false, keepNames: true },
      });
      return { code: await readFile(file, 'utf8') };
    });
  },

  async farm(input, method) {
    const { build, Logger } = await import('@farmfe/core');
    // Logger level: 'error' doesn't silence "Build completed" — override info methods directly
    const noop = () => { /* empty */ };
    const silent = Object.assign(new Logger({ level: 'error' }), {
      info: noop, warn: noop, debug: noop, trace: noop, infoOnce: noop, warnOnce: noop, logMessage: noop,
    });
    return withTmpDir(async dir => {
      await build({
        root: testDir,
        logger: silent,
        plugins: [pluginFor('farm')(pluginOpts(method))],
        compilation: {
          input: { index: input },
          output: { path: dir, targetEnv: 'node', format: 'cjs' },
          minify: false,
          sourcemap: false,
          lazyCompilation: false,
          persistentCache: false,
          // force single-file output — otherwise farm splits into __farm_runtime.js + chunks
          partialBundling: { enforceResources: [{ name: 'index', test: ['.+'] }] },
        },
        server: { hmr: false },
      });
      // farm emits .js but test dir has `"type": "module"` — force CJS via .cjs extension
      return { code: await readFile(join(dir, 'index.js'), 'utf8'), ext: '.cjs' };
    });
  },

  // build in bun (Bun.build API only available in bun runtime, so spawn bun),
  // then verify in bun (output mixes CJS/ESM and can't be loaded by node)
  async bun(input, method) {
    return withTmpDir(async dir => {
      const buildScript = join(dir, 'build.mjs');
      await writeFile(buildScript, `
        import { bun as plugin } from ${ JSON.stringify(pathToFileURL(unpluginPath).href) };
        const result = await Bun.build({
          entrypoints: [${ JSON.stringify(input) }],
          outdir: ${ JSON.stringify(dir) },
          target: 'node',
          naming: 'bundle.js',
          plugins: [plugin(${ JSON.stringify(pluginOpts(method)) })],
        });
        if (!result.success) { for (const l of result.logs) console.error(l); process.exit(1); }
      `);
      await $({ quiet: true })`bun ${ buildScript }`;
      return { code: await readFile(join(dir, 'bundle.js'), 'utf8'), verifier: 'bun' };
    });
  },
};

// --- run ---

const hasBun = await which('bun', { nothrow: true });
let failures = 0;

for (const [name, build] of Object.entries(builders)) {
  if (name === 'bun' && !hasBun) {
    echo(chalk.yellow('bun: skipped (not installed)'));
    continue;
  }
  try {
    for (const method of methods) {
      const label = `${ name }/${ method }`;
      const { code, ext, verifier } = await build(inputOf(method), method);
      if (verifier === 'bun') await verifyInBun(code, label, method);
      else await verifyInNode(code, label, ext);
      echo(chalk.green(`${ label } passed`));
    }
  } catch (error) {
    echo(chalk.red(`${ name } failed: ${ error.message }`));
    failures++;
  }
}

if (failures) throw new Error(`${ failures } integration test(s) failed`);
echo(chalk.green('\nAll integration tests passed'));

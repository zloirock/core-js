import { deepStrictEqual } from 'node:assert';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';

const testDir = dirname(fileURLToPath(import.meta.url));
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
  const dir = await mkdtemp(join(tmpdir(), 'transpiler-test-'));
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function verifyBundle(code, label, ext = '.mjs') {
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

async function webpackLikeBuild(compiler, config) {
  const { promisify } = await import('node:util');
  const instance = compiler(config);
  try {
    const stats = await promisify(instance.run.bind(instance))();
    if (stats.hasErrors()) throw new Error(stats.compilation.errors[0].message);
  } finally {
    await promisify(instance.close.bind(instance))();
  }
}

// --- babel (transform with @core-js/babel-plugin, then bundle with esbuild) ---

async function babelBuild(input, method) {
  const { transformAsync } = await import('@babel/core');
  const { build } = await import('esbuild');
  const source = await readFile(input, 'utf8');
  const { code: transformed } = await transformAsync(source, {
    filename: input,
    plugins: [['@core-js', pluginOpts(method)]],
  });
  const result = await build({
    stdin: { contents: transformed, resolveDir: dirname(input), loader: 'js' },
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'node',
  });
  return { code: result.outputFiles[0].text, ext: '.cjs' };
}

// --- unplugin bundlers ---
// each: async (input, pluginInstance) => { code, ext }

const bundlers = {
  async esbuild(input, plugin) {
    const { build } = await import('esbuild');
    const result = await build({
      entryPoints: [input],
      bundle: true,
      write: false,
      format: 'cjs',
      platform: 'node',
      plugins: [plugin],
    });
    return { code: result.outputFiles[0].text, ext: '.cjs' };
  },

  async rollup(input, plugin) {
    const { rollup } = await import('rollup');
    const nodeResolve = (await import('@rollup/plugin-node-resolve')).default;
    const commonjs = (await import('@rollup/plugin-commonjs')).default;
    const bundle = await rollup({
      input,
      plugins: [plugin, nodeResolve(), commonjs()],
      // @rollup/plugin-commonjs generates false circular dependency warnings
      onwarn(warning, handler) { if (warning.code !== 'CIRCULAR_DEPENDENCY') handler(warning); },
    });
    const { output } = await bundle.generate({ format: 'es' });
    return { code: output[0].code };
  },

  async vite(input, plugin) {
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
      plugins: [plugin],
    });
    const [{ output }] = Array.isArray(result) ? result : [result];
    return { code: output[0].code };
  },

  async webpack(input, plugin) {
    const wp = (await import('webpack')).default;
    return withTmpDir(async dir => {
      const filename = 'out.mjs';
      await webpackLikeBuild(wp, {
        mode: 'production',
        devtool: false,
        entry: input,
        output: { path: dir, filename, module: true, library: { type: 'module' } },
        experiments: { outputModule: true },
        optimization: { minimize: false },
        plugins: [plugin],
      });
      return { code: await readFile(join(dir, filename), 'utf8') };
    });
  },

  async rspack(input, plugin) {
    const { rspack: rs } = await import('@rspack/core');
    return withTmpDir(async dir => {
      const filename = 'out.mjs';
      await webpackLikeBuild(rs, {
        mode: 'production',
        devtool: false,
        entry: input,
        output: { path: dir, filename, module: true, library: { type: 'module' } },
        experiments: { outputModule: true },
        optimization: { minimize: false },
        plugins: [plugin],
      });
      return { code: await readFile(join(dir, filename), 'utf8') };
    });
  },

  async rolldown(input, plugin) {
    const { build } = await import('rolldown');
    return withTmpDir(async dir => {
      const file = join(dir, 'out.mjs');
      await build({
        input,
        platform: 'node',
        treeshake: false,
        plugins: [plugin],
        output: { format: 'esm', file, externalLiveBindings: false, keepNames: true },
      });
      return { code: await readFile(file, 'utf8') };
    });
  },
};

// --- run ---

const pluginExports = await import('@core-js/unplugin');
let failures = 0;

// --- babel-plugin ---
try {
  for (const method of methods) {
    const { code, ext } = await babelBuild(inputOf(method), method);
    await verifyBundle(code, `babel/${ method }`, ext);
    echo(chalk.green(`babel/${ method } passed`));
  }
} catch (error) {
  echo(chalk.red(`babel failed: ${ error.message }`));
  failures++;
}

// --- unplugin × bundlers ---
for (const [bundlerName, build] of Object.entries(bundlers)) {
  try {
    for (const method of methods) {
      const plugin = pluginExports[bundlerName](pluginOpts(method));
      const { code, ext } = await build(inputOf(method), plugin);
      await verifyBundle(code, `${ bundlerName }/${ method }`, ext);
      echo(chalk.green(`${ bundlerName }/${ method } passed`));
    }
  } catch (error) {
    echo(chalk.red(`${ bundlerName } failed: ${ error.message }`));
    failures++;
  }
}

// --- bun (requires `bun` binary — Bun.build API only available in bun runtime) ---
try {
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const exec = promisify(execFile);
  let bunVersion;
  try {
    bunVersion = (await exec('bun', ['--version'])).stdout.trim();
  } catch {
    echo(chalk.yellow('bun: skipped (not installed)'));
  }
  if (bunVersion) {
    // JSON.stringify gives safe string literals (escapes backslashes on Windows, quotes, newlines)
    const unpluginPath = JSON.stringify(pathToFileURL(resolve(testDir, '../../packages/core-js-unplugin/index.js')).href);
    for (const method of methods) {
      await withTmpDir(async dir => {
        const input = JSON.stringify(inputOf(method));
        const outdir = JSON.stringify(dir);
        const bundleUrl = JSON.stringify(pathToFileURL(join(dir, 'bundle.js')).href);
        const opts = JSON.stringify(pluginOpts(method));
        const exp = JSON.stringify(expected);
        const buildScript = join(dir, 'build.mjs');
        await writeFile(buildScript, `
          import { bun as plugin } from ${ unpluginPath };
          const result = await Bun.build({
            entrypoints: [${ input }],
            outdir: ${ outdir },
            target: 'node',
            naming: 'bundle.js',
            plugins: [plugin(${ opts })],
          });
          if (!result.success) { for (const l of result.logs) console.error(l); process.exit(1); }
        `);
        await exec('bun', [buildScript]);
        // verify in bun (bun output mixes CJS/ESM — not loadable by node)
        // usage-pure checks named exports; global methods check patched globals
        const verifyScript = join(dir, 'verify.mjs');
        const isPure = method === 'usage-pure';
        await writeFile(verifyScript, isPure ? `
          import { deepStrictEqual, strictEqual } from 'node:assert';
          const mod = await import(${ bundleUrl });
          const exp = ${ exp };
          deepStrictEqual(Array.from(mod.filterReject), exp.filterReject);
          deepStrictEqual(Array.from(mod.uniqueBy), exp.uniqueBy);
          strictEqual(mod.setFrom, exp.setFrom);
          strictEqual(mod.cooked, exp.cooked);
        ` : `
          import { deepStrictEqual, strictEqual } from 'node:assert';
          await import(${ bundleUrl });
          const exp = ${ exp };
          deepStrictEqual([1,2,3,4].filterReject(x => x % 2), exp.filterReject);
          deepStrictEqual([1,2,3,2,1].uniqueBy(), exp.uniqueBy);
          strictEqual(Set.from([1,2,3]).size, exp.setFrom);
          strictEqual(String.cooked\`hello\`, exp.cooked);
        `);
        await exec('bun', [verifyScript]);
      });
      echo(chalk.green(`bun/${ method } passed`));
    }
  }
} catch (error) {
  echo(chalk.red(`bun failed: ${ error.message }`));
  failures++;
}

if (failures) throw new Error(`${ failures } integration test(s) failed`);
echo(chalk.green('\nAll integration tests passed'));

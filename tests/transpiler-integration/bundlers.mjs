// The bundler adapters, one entry per supported tool: `(input, plugins, extra) -> { code, ext?, map? }`.
// The caller supplies the plugins it wants registered - unplugin's adapter for a bundler, or a sibling
// beside it - and gets the bundle back as text. Everything a tool needs to produce one node-loadable
// file is set here, so the matrix in `runner.mjs` stays about methods and phases.
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

export async function withTmpDir(fn) {
  const dir = await mkdtemp(join(tmpdir(), 'core-js-bundlers-'));
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

export function makeBundlers({
  // the directory vite, rsbuild and farm root their configuration at
  root,
} = {}) {
  // vite, rsbuild and farm all resolve from `root`, and each of them silently falls back to the
  // process working directory - which under `zxi cd` is whichever suite happens to be running
  if (!root) throw new Error('makeBundlers: `root` is required');

  async function webpackLike(compiler, input, plugins, { inlineDynamic } = {}) {
    return withTmpDir(async dir => {
      const filename = 'out.mjs';
      const all = [...plugins];
      // the dynamic-import leg must stay a single node-loadable file - fold async chunks back in
      if (inlineDynamic) all.push(new compiler.optimize.LimitChunkCountPlugin({ maxChunks: 1 }));
      const instance = compiler({
        mode: 'production',
        devtool: false,
        entry: input,
        output: { path: dir, filename, module: true, library: { type: 'module' } },
        experiments: { outputModule: true },
        optimization: { minimize: false },
        plugins: all,
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

  return {
    // `input` is an entry path, or the esbuild input option itself - `{ stdin: ... }` for a caller
    // that has the source in hand rather than on disk
    async esbuild(input, plugins = []) {
      const { build } = await import('esbuild');
      const result = await build({
        ...typeof input === 'string' ? { entryPoints: [input] } : input,
        plugins,
        bundle: true,
        write: false,
        // the runner loads what it built, and esbuild is the one tool here whose output this suite
        // takes as CommonJS - hence the extension that goes with it
        format: 'cjs',
        platform: 'node',
      });
      return { code: result.outputFiles[0].text, ext: '.cjs' };
    },

    async rollup(input, plugins = [], { inlineDynamic } = {}) {
      const { rollup } = await import('rollup');
      const nodeResolve = (await import('@rollup/plugin-node-resolve')).default;
      const commonjs = (await import('@rollup/plugin-commonjs')).default;
      const bundle = await rollup({
        input,
        plugins: [...plugins, nodeResolve(), commonjs()],
      });
      try {
        const { output } = await bundle.generate({ format: 'es', sourcemap: true, inlineDynamicImports: !!inlineDynamic });
        return { code: output[0].code, map: output[0].map };
      } finally {
        await bundle.close();
      }
    },

    async vite(input, plugins = [], { inlineDynamic } = {}) {
      const { build } = await import('vite');
      const result = await build({
        root,
        logLevel: 'silent',
        build: {
          write: false,
          sourcemap: true,
          minify: false,
          lib: { entry: input, formats: ['es'] },
          // the ids vite hands to its CommonJS interop: the inputs here need core-js alone
          commonjsOptions: { include: [/core-js/] },
          // vite bundles with rolldown, so the output option follows rolldown's spelling
          rollupOptions: inlineDynamic ? { output: { codeSplitting: false } } : {},
        },
        resolve: { dedupe: ['core-js'] },
        plugins,
      });
      const [{ output }] = Array.isArray(result) ? result : [result];
      return { code: output[0].code, map: output[0].map };
    },

    async webpack(input, plugins = [], extra = {}) {
      const webpack = (await import('webpack')).default;
      return webpackLike(webpack, input, plugins, extra);
    },

    async rspack(input, plugins = [], extra = {}) {
      const { rspack } = await import('@rspack/core');
      return webpackLike(rspack, input, plugins, extra);
    },

    // rsbuild drives rspack: same chunk-loader semantics, plugin passed through unplugin's rsbuild
    // adapter. environments-based config keeps the output a single node-loadable file
    async rsbuild(input, plugins = [], { inlineDynamic } = {}) {
      const { createRsbuild } = await import('@rsbuild/core');
      return withTmpDir(async dir => {
        const rsbuild = await createRsbuild({
          cwd: root,
          rsbuildConfig: {
            mode: 'production',
            logLevel: 'error',
            source: { entry: { index: input } },
            plugins,
            output: {
              target: 'node',
              distPath: { root: dir },
              filenameHash: false,
              minify: false,
              sourceMap: false,
            },
            performance: { chunkSplit: { strategy: 'all-in-one' } },
            tools: {
              rspack: async config => {
                config.output = { ...config.output, module: true, library: { type: 'module' } };
                config.experiments = { ...config.experiments, outputModule: true };
                // the dynamic-import leg must stay a single node-loadable file
                if (inlineDynamic) {
                  const { rspack } = await import('@rspack/core');
                  config.plugins.push(new rspack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }));
                }
                return config;
              },
            },
          },
        });
        await rsbuild.build();
        return { code: await readFile(join(dir, 'index.js'), 'utf8') };
      });
    },

    async rolldown(input, plugins = [], { inlineDynamic } = {}) {
      const { build } = await import('rolldown');
      return withTmpDir(async dir => {
        const file = join(dir, 'out.mjs');
        await build({
          input,
          platform: 'node',
          treeshake: false,
          plugins,
          output: {
            format: 'esm', file, externalLiveBindings: false, keepNames: true,
            // rolldown spells single-chunk output as `codeSplitting: false` and deprecated
            // `inlineDynamicImports`, which warns whenever the key is PRESENT - even set to `false`
            ...inlineDynamic && { codeSplitting: false },
          },
        });
        return { code: await readFile(file, 'utf8') };
      });
    },

    async farm(input, plugins = []) {
      const { build, Logger } = await import('@farmfe/core');
      // Logger level: 'error' doesn't silence "Build completed" - override info methods directly
      function noop() { /* empty */ }
      const silent = Object.assign(new Logger({ level: 'error' }), {
        info: noop, warn: noop, debug: noop, trace: noop, infoOnce: noop, warnOnce: noop, logMessage: noop,
      });
      return withTmpDir(async dir => {
        await build({
          root,
          logger: silent,
          plugins,
          compilation: {
            input: { index: input },
            output: { path: dir, targetEnv: 'node', format: 'cjs' },
            minify: false,
            sourcemap: false,
            lazyCompilation: false,
            persistentCache: false,
            // force single-file output - otherwise farm splits into __farm_runtime.js + chunks
            partialBundling: { enforceResources: [{ name: 'index', test: ['.+'] }] },
          },
          server: { hmr: false },
        });
        // farm emits .js but both suites are `"type": "module"` - force CJS via .cjs extension
        return { code: await readFile(join(dir, 'index.js'), 'utf8'), ext: '.cjs' };
      });
    },
  };
}

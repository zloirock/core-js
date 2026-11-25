// Exercise Vite's request contexts and its cached transform result on a single dev server.
import { strict as assert } from 'node:assert';
import { realpath, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { createServer } from 'vite';
import { transform } from 'esbuild';
import unplugin, { vite } from '../../packages/core-js-unplugin/index.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { withCleanup, withTmpDir } from './runtime.mjs';

async function serve(method, filename, sibling, verify) {
  await withTmpDir(async dir => {
    const root = await realpath(dir);
    const id = join(root, filename).replaceAll('\\', '/');
    await writeFile(id, 'export default 0;');
    const server = await createServer({
      root, configFile: false, server: { middlewareMode: true, watch: null, ws: false },
      optimizeDeps: { noDiscovery: true, include: [] },
      plugins: [vite({ phase: 'pre+post', method, version: '4.0', targets: { ie: 11 }, importStyle: 'require' }), sibling(id)],
    });
    const { client } = server.environments;
    async function invalidate() {
      const node = client.moduleGraph.getModuleById(id);
      client.moduleGraph.invalidateModule(node);
      await client.pluginContainer.watchChange(id, { event: 'update' });
      // Vite caches a result only when its request started strictly after invalidation.
      while (Date.now() <= node.lastInvalidationTimestamp) await setTimeout(1);
    }
    await withCleanup(async () => {
      await verify(() => server.transformRequest(`/${ filename }`), invalidate,
        () => client.pluginContainer.getModuleInfo(id)?.meta.coreJSRequires ?? [], root);
    }, () => server.close());
  });
}

async function waitForSibling(result, entered) {
  async function skipped() {
    await result;
    throw new Error('Sibling hook skipped');
  }
  await Promise.race([entered, skipped()]);
}

async function overlap(method, newerFirst) {
  const pure = method === 'usage-pure';
  const source = pure
    ? ['export const r = Array.of(2)[0];', 'Array.from = () => [23]; export const r = Array.from([])[0];']
    : ['export const r = Array.from([2])[0];', 'export const r = [23].at(0);'];
  const entered = [Promise.withResolvers(), Promise.withResolvers()];
  const release = [Promise.withResolvers(), Promise.withResolvers()];
  let revision = 0;
  let compilerCalls = 0;
  await serve(method, 'feature.mjs', id => ({
    name: 'interleaved-compiler',
    load(file) { if (file === id) return source[revision]; },
    async transform(_, file) {
      if (file !== id) return;
      compilerCalls++;
      const current = revision;
      entered[current].resolve();
      await release[current].promise;
      if (current === 0) return 'export const r = 2;';
      // The compiler moved the write into a dependency, or made the key opaque.
      return pure ? 'export const r = Array.from([])[0];'
        : 'export const r = [23][String.fromCharCode(97, 116)](0);';
    },
  }), async (request, invalidate, requires, root) => {
    try {
      const old = request();
      await waitForSibling(old, entered[0].promise);
      await invalidate();
      revision++;
      const latest = request();
      await waitForSibling(latest, entered[1].promise);
      for (const i of newerFirst ? [1, 0] : [0, 1]) {
        release[i].resolve();
        await [old, latest][i];
      }
      const { code } = await latest;
      assert.equal((await request()).code, code);
      assert.equal(compilerCalls, 2);
      const output = join(root, 'cached.mjs');
      await writeFile(output, `import { createRequire } from 'node:module';
        const require = createRequire(${ JSON.stringify(import.meta.url) });
        ${ pure ? 'Array.from = () => [23];' : '' }
        ${ code }
        export const effects = [];`);
      assert.equal(await runInWorker(output, { stripGlobals: [] }), 'OK|23|[]');
      if (pure) assert.deepEqual(requires(), []);
      else {
        assert.ok(requires().some(([name]) => name.endsWith('/es.array.at')));
        assert.ok(requires().every(([name]) => !name.endsWith('/es.array.from')));
      }
    } finally {
      for (const gate of release) gate.resolve();
    }
  });
}

export async function viteHandoff(run) {
  await run('unplugin/pre+post/async helper after esbuild', async () => {
    const id = '/jobs.mjs';
    const source = 'export class Jobs { async run(...args) { return [...args]; } }';
    const options = { phase: 'pre+post', method: 'usage-pure', targets: { ie: 11 } };
    for (const lowering of [false, true]) {
      const [pre, post] = unplugin.raw(options, { framework: 'vite' });
      const first = pre.transform(source, id)?.code ?? source;
      assert.ok(!first.includes('Promise'));
      const next = lowering ? (await transform(first, { target: 'es2016', format: 'esm' })).code : first;
      assert.equal(next.includes('new Promise'), lowering);
      const output = post.transform(next, id)?.code ?? next;
      assert.equal(output.includes('@core-js/pure/actual/promise/constructor'), lowering);
    }
  });
  await run('vite/component-rebuild/late old compiler', async () => {
    let latest = false;
    let compilerCalls = 0;
    const entered = Promise.withResolvers();
    const release = Promise.withResolvers();
    await serve('usage-pure', 'Late.vue', id => ({
      name: 'async-component-compiler',
      async transform(_, file) {
        if (file !== id) return;
        compilerCalls++;
        if (latest) return 'export default 2;';
        entered.resolve();
        await release.promise;
        return 'export default [3].at(0);';
      },
    }), async (request, invalidate, requires) => {
      const old = request();
      try {
        await waitForSibling(old, entered.promise);
        await invalidate();
        latest = true;
        const fresh = await request();
        release.resolve();
        assert.match((await old).code, /require\(/u);
        assert.equal((await request()).code, fresh.code);
        assert.equal(compilerCalls, 2);
        assert.deepEqual(requires(), []);
      } finally {
        release.resolve();
      }
    });
  });
  for (const method of ['usage-global', 'usage-pure']) {
    for (const newerFirst of [false, true]) {
      await run(`vite/${ method }/overlap/${ newerFirst ? 'new' : 'old' }-first`, () => overlap(method, newerFirst));
    }
    await run(`vite/${ method }/component-rebuild`, async () => {
      let compiled = 'export default [1].at(0);';
      await serve(method, 'Probe.vue', id => ({
        name: 'component-compiler',
        transform(_, file) { if (file === id) return compiled; },
      }), async (request, invalidate, requires) => {
        await request();
        const first = requires();
        assert.ok(first.length > 0);
        for (const source of ['export default [2].at(0);', 'export default 2;']) {
          compiled = source;
          await invalidate();
          await request();
          assert.deepEqual(requires(), source.includes('.at') ? first : []);
        }
      });
    });
  }
}

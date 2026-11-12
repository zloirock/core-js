// A later compiler consumes file pragmas and composes the plugin's module maps.
import { strict as assert } from 'node:assert';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import unplugin from '../../packages/core-js-unplugin/index.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';

const { TraceMap, originalPositionFor, encodedMappings } = createRequire(new URL('../unplugin/package.json', import.meta.url))('@jridgewell/trace-mapping');
const root = resolve(import.meta.dirname, '../..');
const aliases = { 'core-js': join(root, 'packages/core-js'), '@core-js/pure': join(root, 'packages/core-js-pure') };
const methods = ['entry-global', 'usage-global', 'usage-pure'];
function options(method) { return { method, version: '4.0', mode: 'full', targets: { ie: 11 } }; }
function linesOf(source) { return source.split(/\r\n|[\n\r\u2028\u2029]/); }

function markerPosition(code, map) {
  const prefix = linesOf(code.slice(0, code.indexOf('mapMarker')));
  return originalPositionFor(new TraceMap(map), { line: prefix.length, column: prefix.at(-1).length });
}

export async function leadingCommentsAndMaps(run) {
  const dir = await mkdtemp(join(tmpdir(), 'core-js-leading-maps-'));
  try {
    const esbuild = await import('esbuild');
    const vite = await import('vite');
    await mkdir(join(dir, 'maps'));
    for (const method of methods) {
      const entry = method === 'entry-global' ? 'import "core-js/actual/array/at";\n' : '';
      for (const inline of [false, true]) await run(`esbuild input map/${ method }/${ inline }`, async () => {
        const code = `${ entry }const mapMarker = [7].at(0); globalThis.result = mapMarker;`;
        const prefix = linesOf(code.slice(0, code.indexOf('mapMarker')));
        const mappings = Array.from({ length: prefix.length }, () => []);
        mappings[prefix.length - 1].push([prefix.at(-1).length, 0, 2, 6]);
        const original = '// typed source\n\nconst mapMarker: number = [7].at(0);';
        const raw = { version: 3, names: [], sources: ['original.ts'], sourceRoot: '../src/', sourcesContent: [original], mappings };
        raw.mappings = encodedMappings(new TraceMap(raw));
        await writeFile(join(dir, 'maps/input.js.map'), JSON.stringify(raw));
        const url = inline ? `data:application/json;base64,${ Buffer.from(JSON.stringify(raw)).toString('base64') }` : 'maps/input.js.map';
        const file = join(dir, 'input.js');
        await writeFile(file, `${ code }\n//# sourceMappingURL=${ url }`);
        const built = await esbuild.build({ entryPoints: [file], bundle: true, write: false, format: 'iife',
          outfile: join(dir, 'output.js'), sourcemap: 'external', alias: aliases,
          plugins: [unplugin.esbuild(options(method))], logLevel: 'silent' });
        const output = built.outputFiles.find(item => item.path.endsWith('.js')).text;
        const map = JSON.parse(built.outputFiles.find(item => item.path.endsWith('.map')).text);
        assert.equal(runInNewContext(`Array.prototype.at = undefined;\n${ output }\nresult;`), 7);
        const position = markerPosition(output, map);
        assert.deepEqual([position.line, position.column], [3, 6]);
        assert.ok(position.source.endsWith('/src/original.ts'), position.source);
        assert.ok(map.sourcesContent.includes(original));
      });
      const phases = method === 'entry-global' ? [null] : ['pre', 'post', 'pre+post'];
      for (const phase of phases) await run(`vite leading pragma and lines/${ method }/${ phase }`, async () => {
        const file = join(dir, 'view.tsx');
        const source = `/** @jsx h */\n${ entry }function h(tag, props, child) { return [tag, child]; }
/* first${ String.fromCharCode(0x2028) }last */ export const mapMarker = <box>{[7].at(0)}</box>;`;
        await writeFile(file, source);
        const result = await vite.build({ root: dir, configFile: false, logLevel: 'silent',
          resolve: { alias: aliases }, plugins: [unplugin.vite({ ...options(method), ...phase ? { phase } : {} })],
          oxc: { jsx: { runtime: 'classic' } },
          build: { write: false, minify: false, sourcemap: true, lib: { entry: file, formats: ['es'], fileName: 'view' } } });
        const [{ output: outputs }] = Array.isArray(result) ? result : [result];
        const chunk = outputs.find(output => output.type === 'chunk' && output.isEntry);
        assert.ok(chunk?.map);
        const prefix = linesOf(source.slice(0, source.indexOf('mapMarker')));
        const position = markerPosition(chunk.code, chunk.map);
        assert.deepEqual([position.line, position.column], [prefix.length, prefix.at(-1).length]);
        const output = join(dir, `output-${ method }-${ phase }.mjs`);
        await writeFile(output, `${ chunk.code }\nexport { mapMarker as r }; export const effects = [];`);
        assert.equal(await runInWorker(output, { stripGlobals: [] }), 'OK|["box",7]|[]');
      });
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

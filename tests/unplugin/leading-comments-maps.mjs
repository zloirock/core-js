// File pragmas belong before injected tokens; mappings must still name the original token.
/* eslint-disable node/no-sync -- Exercise the synchronous transform and parser contracts. */
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { TraceMap, encodedMappings, originalPositionFor } from '@jridgewell/trace-mapping';
import { parseSync } from 'oxc-parser';
import createPlugin from '../../packages/core-js-unplugin/internals/plugin.js';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import { createChecker } from '../polyfill-provider/harness.mjs';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';

const { check, checkDeep, checkTruthy, finish } = createChecker('leading-comments-maps');
const integration = createRequire(new URL('../transpiler-integration/package.json', import.meta.url));
const { transform } = await import(pathToFileURL(integration.resolve('rolldown/experimental')).href);
const options = { version: '4.0', targets: { ie: 11 } };
const methods = ['entry-global', 'usage-global', 'usage-pure'];
function linesOf(text) { return text.split(/\r\n|[\n\r\u2028\u2029]/); }
function entry(method) { return method === 'entry-global' ? 'import "core-js/actual/array/at";\n' : ''; }
const directory = await mkdtemp(join(import.meta.dirname, '../transpiler-differential/tmp/leading-maps-'));
let serial = 0;

function mappedToken(out, token) {
  const before = linesOf(out.code.slice(0, out.code.indexOf(token)));
  return originalPositionFor(new TraceMap(out.map), { line: before.length, column: before.at(-1).length });
}

try {
  const hosts = [['unplugin', (source, method) => createPlugin({ ...options, method }).transform(source, '/view.tsx')]];
  for (const version of ['babel-plugin', 'babel-plugin-v7']) {
    const { transformSync, transformFromAstSync, parseSync: parseBabel } = createRequire(new URL(`../${ version }/package.json`, import.meta.url))('@babel/core');
    hosts.push([version, (source, method, sibling = false) => transformSync(source, {
      filename: '/view.tsx', babelrc: false, configFile: false,
      parserOpts: { plugins: ['jsx', 'typescript'] }, plugins: [
        ...sibling ? [({ types }) => ({ pre(file) {
          file.path.unshiftContainer('body', types.variableDeclaration('const', [types.variableDeclarator(types.identifier('sibling'), types.numericLiteral(1))]));
        } })] : [],
        [babelPlugin, { ...options, method }],
      ],
    })]);
    const source = '/** @jsx h */\n/** @jsxFrag Fragment */\nexport const r = <>{[7].at(0)}</>;';
    const config = { filename: '/view.tsx', babelrc: false, configFile: false, parserOpts: { plugins: ['jsx'] } };
    const result = transformFromAstSync(parseBabel(source, config), undefined, {
      ...config, plugins: [[babelPlugin, { ...options, method: 'usage-pure' }]],
    });
    const lowered = await transform('view.tsx', result.code, { jsx: { runtime: 'classic' } });
    check(`${ version }/AST without source retains both pragmas`, lowered.code.includes('React'), false);
  }
  for (const [host, compile] of hosts) for (const method of methods) {
    for (const hashbang of ['', '#!/usr/bin/env node\n']) {
      const source = `${ hashbang }/** @jsx h */\n/** @jsxFrag Fragment */\n/** @jsxRuntime classic */\n${ entry(method) }
function h(tag, props, ...children) { return [tag, ...children]; }
const Fragment = 'fragment';
export const r = <><box>{[7].at(0)}</box></>;
export const effects = [];`;
      const result = compile(source, method);
      const code = result?.code ?? source;
      const lowered = await transform('view.tsx', code, { jsx: { runtime: 'automatic' } });
      const label = `${ host }/${ method }/${ !!hashbang }`;
      check(`${ label }/lowering`, lowered.errors.length, 0);
      checkTruthy(`${ label }/pragma remains leading`, /^#![^\n]*\n\/\*\* @jsx h|^\/\*\* @jsx h/.test(code));
      const file = join(directory, `view-${ serial++ }.mjs`);
      await writeFile(file, lowered.code);
      check(`${ label }/runtime`, await runInWorker(file, { strip: false }), 'OK|["fragment",["box",7]]|[]');
    }
    const automatic = `/** @jsxImportSource custom-jsx */\n${ entry(method) }export const r = <box>{[7].at(0)}</box>;`;
    const output = compile(automatic, method)?.code ?? automatic;
    const lowered = await transform('view.tsx', output, { jsx: { runtime: 'automatic' } });
    checkTruthy(`${ host }/${ method }/automatic source`, lowered.code.includes('custom-jsx/jsx-runtime'));
    if (host !== 'unplugin') {
      const earlier = compile(automatic, method, true).code;
      checkTruthy(`${ host }/${ method }/earlier sibling keeps file pragma`, earlier.startsWith('/** @jsxImportSource'));
    }
    if (method !== 'entry-global') {
      const disabled = '/** @jsx h\n * core-js-disable-next-line */\nexport const untouched = [7].at(0);\nexport const changed = [7].includes(7);';
      const first = compile(disabled, method)?.code ?? disabled;
      const second = compile(first, method)?.code ?? first;
      checkTruthy(`${ host }/${ method }/mixed pragma keeps opted-out call`, second.includes('[7].at(0)'));
      checkTruthy(`${ host }/${ method }/mixed pragma still injects`, second.includes(method === 'usage-pure' ? 'instance/includes' : 'es.array.includes'));
    }
    const late = `${ entry(method) }export const before = 1;\n/** @jsx h */\nexport const after = [7].at(0);`;
    check(`${ host }/${ method }/late pragma is not promoted`, /^\/\*\* @jsx h/.test(compile(late, method)?.code ?? late), false);
  }
  for (const method of methods) {
    for (const bom of ['', '\uFEFF', '\uFEFF\uFEFF']) {
      const source = `${ bom }export const marker = xs => xs.at(0);\n${ entry(method) }export const tail = marker;`;
      const out = createPlugin({ ...options, method }).transform(source, '/bom.mjs');
      check(`${ method }/bom${ bom.length }/content`, out.map.sourcesContent[0], source);
      checkDeep(`${ method }/bom${ bom.length }/position`,
        [mappedToken(out, 'marker').line, mappedToken(out, 'marker').column], [1, source.indexOf('marker')]);
    }
    for (const separator of ['\n', '\r\n', '\r', '\u2028', '\u2029']) {
      for (const carrier of ['comment', 'string', 'template', 'jsx']) {
        if (carrier === 'string' && /[\n\r]/.test(separator)) continue;
        const prefix = carrier === 'comment' ? `/* first${ separator }last */`
          : carrier === 'string' ? `const text = "first${ separator }last";`
            : carrier === 'template' ? `const text = \`first${ separator }last\`;` : `const text = <box>first${ separator }last</box>;`;
        const source = `${ entry(method) }${ prefix } export const marker = xs => xs.at(0);`;
        const out = createPlugin({ ...options, method }).transform(source, '/separator.tsx');
        const original = linesOf(source.slice(0, source.indexOf('marker')));
        const position = mappedToken(out, 'marker');
        checkDeep(`${ method }/${ carrier }/${ JSON.stringify(separator) }/map`,
          [position.line, position.column], [original.length, original.at(-1).length]);
        check(`${ method }/${ carrier }/${ JSON.stringify(separator) }/parse`, parseSync('/separator.tsx', out.code).errors.length, 0);
      }
    }
    const code = `${ entry(method) }export const marker = xs => xs.at(0);`;
    const before = linesOf(code.slice(0, code.indexOf('marker')));
    const mappings = Array.from({ length: before.length }, () => []);
    mappings[before.length - 1].push([before.at(-1).length, 0, 2, 13]);
    const content = '// original\n\nexport const marker = xs => xs.at(0);';
    const map = { version: 3, names: [], sources: ['../src/original.ts'], sourcesContent: [content], mappings };
    map.mappings = encodedMappings(new TraceMap(map));
    await writeFile(join(directory, 'input.js.map'), JSON.stringify(map));
    for (const url of ['input.js.map', `data:application/json;base64,${ Buffer.from(JSON.stringify(map)).toString('base64') }`,
      `data:application/json;charset=utf-8,${ encodeURIComponent(JSON.stringify(map)) }`]) {
      const source = `${ code }\n//# sourceMappingURL=${ url }`;
      const out = createPlugin({ ...options, method }).transform(source, join(directory, 'input.js'));
      const position = mappedToken(out, 'marker');
      checkTruthy(`${ method }/input-map/${ url.slice(0, 30) }/source`, position.source.endsWith('/src/original.ts'));
      checkDeep(`${ method }/input-map/position`, [position.line, position.column], [3, 13]);
      check(`${ method }/input-map/content`, out.map.sourcesContent[0], content);
      check(`${ method }/input-map/consumed comment`, out.code.includes('sourceMappingURL'), false);
    }
    function encoded(value) { return `data:application/json;base64,${ Buffer.from(JSON.stringify(value)).toString('base64') }`; }
    for (const indexed of [false, true]) {
      const inputMap = indexed ? { version: 3, sections: [{ offset: { line: 0, column: 0 }, map }] } : map;
      const out = createPlugin({ ...options, method }).transform(
        `${ code }\n//# sourceMappingURL=missing.map\n/*# sourceMappingURL=${ encoded(inputMap) } */`, join(directory, 'input.js'));
      checkDeep(`${ method }/last block map/indexed=${ indexed }`,
        [mappedToken(out, 'marker').line, mappedToken(out, 'marker').column], [3, 13]);
      check(`${ method }/all old map comments removed`, out.code.includes('sourceMappingURL'), false);
    }
    for (const indexed of [false, true, 'nested']) for (const decoded of [false, true]) {
      const namedMappings = Array.from({ length: before.length }, () => []);
      namedMappings[before.length - 1].push([before.at(-1).length, 1, 2, 13, 0]);
      const named = { version: 3, sources: ['unused.ts', '../src/original.ts'], names: ['originalMarker'],
        sourcesContent: ['// unused', content], ignoreList: [1], mappings: namedMappings };
      if (!decoded) named.mappings = encodedMappings(new TraceMap(named));
      let inputMap = indexed ? { version: 3, sections: [{ offset: { line: 0, column: 0 }, map: named }] } : named;
      if (indexed === 'nested') inputMap = { version: 3, sections: [{ offset: { line: 0, column: 0 }, map: inputMap }] };
      const mapped = createPlugin({ ...options, method }).transform(
        `${ code }\n//# sourceMappingURL=${ encoded(inputMap) }`, join(directory, 'input.js'));
      const position = mappedToken(mapped, 'marker');
      const label = `${ method }/map metadata/indexed=${ indexed }/decoded=${ decoded }`;
      checkDeep(`${ label }/original`, [position.line, position.column, position.name], [3, 13, 'originalMarker']);
      checkTruthy(`${ label }/ignored source`, mapped.map.ignoreList.includes(mapped.map.sources.indexOf(position.source)));
      checkTruthy(`${ label }/source content`, mapped.map.sourcesContent.includes(content));
    }
    const malformedSegments = [[0, 1, 0, 0], [0, 2, 0, 0], [0, -1, 0, 0], [0, 0, 0, 0, 0], [0, 0],
      [-1], [0, 0, -1, 0], [0, 0, 0, 0.5], [0, 0, 0, 0, 0, 1]];
    for (const indexed of [false, true]) for (const segment of malformedSegments) {
      // The bad segment is beyond every emitted position: validation must still reject it.
      const broken = { ...map, mappings: [...mappings, [], [segment]] };
      // A dangling local index must not accidentally resolve into the next section's tables.
      const inputMap = indexed ? { version: 3, sections: [
        { offset: { line: 0, column: 0 }, map: broken },
        { offset: { line: 20, column: 0 }, map: { ...map, names: ['tailName'] } },
      ] } : broken;
      const source = `${ code }\n//# sourceMappingURL=${ encoded(inputMap) }`;
      const mapped = createPlugin({ ...options, method }).transform(source, join(directory, 'input.js'));
      const label = `${ method }/malformed ${ JSON.stringify(segment) }/indexed=${ indexed }`;
      check(`${ label }/fallback`, mapped.map.sourcesContent[0], source);
      checkTruthy(`${ label }/directive retained`, mapped.code.includes('sourceMappingURL'));
    }
    for (const offset of [{ line: -1, column: 0 }, { line: 0, column: -1 }, { line: 0.5, column: 0 }, { line: 0 }]) {
      const inputMap = { version: 3, sections: [{ offset, map }] };
      const source = `${ code }\n//# sourceMappingURL=${ encoded(inputMap) }`;
      const mapped = createPlugin({ ...options, method }).transform(source, join(directory, 'input.js'));
      check(`${ method }/invalid section offset ${ JSON.stringify(offset) }`, mapped.map.sourcesContent[0], source);
    }
    for (const inputMap of [{ ...map, mappings: '' }, { version: 3, sections: [] }]) {
      const mapped = createPlugin({ ...options, method }).transform(`${ code }\n//# sourceMappingURL=${ encoded(inputMap) }`, join(directory, 'input.js'));
      check(`${ method }/empty map remains unmapped`, mappedToken(mapped, 'marker').source, null);
      check(`${ method }/empty map consumed`, mapped.code.includes('sourceMappingURL'), false);
    }
    for (const url of ['missing.map', 'https://example.invalid/input.map', 'data:application/json;base64,broken', encoded({ version: 3 }),
      encoded({ ...map, version: 2 }),
      encoded({ version: 3, names: [], sources: [], mappings: 'AAAA' })]) {
      const source = `${ code }\n//# sourceMappingURL=${ encoded(map) }\n//# sourceMappingURL=${ url }`;
      const out = createPlugin({ ...options, method }).transform(source, join(directory, 'input.js'));
      check(`${ method }/invalid last map keeps transform content`, out.map.sourcesContent[0], source);
      checkTruthy(`${ method }/unconsumed map comment retained`, out.code.includes(url));
    }
    const string = `${ code }\nexport const text = "//# sourceMappingURL=${ encoded(map) }";`;
    const out = createPlugin({ ...options, method }).transform(string, join(directory, 'input.js'));
    check(`${ method }/a string is not a map directive`, out.map.sourcesContent[0], string);
    const reusable = createPlugin({ ...options, method });
    const linked = `${ code }\n//# sourceMappingURL=input.js.map`;
    reusable.transform(linked, join(directory, 'input.js'));
    const updated = { ...map, sourcesContent: [`${ content }\n// updated`] };
    await writeFile(join(directory, 'input.js.map'), JSON.stringify(updated));
    const again = reusable.transform(linked, join(directory, 'input.js'));
    check(`${ method }/rebuild reads the current linked map`, again.map.sourcesContent[0], updated.sourcesContent[0]);
    for (const id of [pathToFileURL(join(directory, 'input.js')).href, 'https://example.invalid/dist/input.js']) {
      const mapped = createPlugin({ ...options, method }).transform(`${ code }\n//# sourceMappingURL=${ encoded(map) }`, id);
      const position = mappedToken(mapped, 'marker');
      check(`${ method }/inline map follows its URL base`, position.source, new URL('../src/original.ts', id).href);
    }
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}
finish();

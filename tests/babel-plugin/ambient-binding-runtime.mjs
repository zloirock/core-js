// Type-only names do not replace runtime declarations sharing their spelling.
import { createRequire, stripTypeScriptTypes } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('ambient-binding-runtime');
const rows = [
  ...['declare var Map: any;', 'type Map = number;', 'opaque type Map = number;', 'interface Map {}',
    'declare type Map = number;', 'declare opaque type Map: number;', 'declare interface Map {}',
  ].map(declaration => [declaration, 'flow', declaration, 'new Map([[1, 2]]).size', 1]),
  ['ambient root', 'flow', 'declare var globalThis: any;', 'typeof globalThis.Array.from', 'function'],
  ['exported ambient', 'flow', 'declare export var Promise: any;', 'typeof Promise.resolve', 'function'],
  ['function implementation', 'flow', 'declare function structuredClone(v: any): any; function structuredClone(v) { return "user"; }',
    'structuredClone({ a: 1 })', 'user'],
  ['overloaded constructor', 'flow', 'declare function Map(v: string): void; declare function Map(v: number): void; function Map() { this.user = true; }',
    'new Map().user', true],
  ['module type and value', 'flow', 'declare module "m" { declare type Map = number; } const Map = function () { this.user = true; };',
    'new Map().user', true],
  ['import and const', 'typescript', 'import type { default as Map } from "@core-js/pure/actual/map"; const Map = class { user = true; };',
    'new Map().user', true],
  ['inline import and function', 'typescript',
    'import { type default as structuredClone } from "@core-js/pure/actual/structured-clone"; function structuredClone() { return "user"; }',
    'structuredClone()', 'user'],
  ['import and empty var', 'typescript', 'import type { default as Map } from "@core-js/pure/actual/map"; var Map;', 'typeof Map', 'undefined'],
  ['ambient class and function', 'typescript', 'declare class Map {} function Map() { this.user = true; }', 'new Map().user', true],
  ['import and realm value', 'typescript',
    'import type { default as globalThis } from "@core-js/pure/actual/global-this"; const globalThis = { Array: { from: () => 19 } };',
    'globalThis.Array.from()', 19],
  ['ambient realm and runtime function', 'flow', 'declare function globalThis(): void; function globalThis() {} globalThis.Array = { from: () => 23 };',
    'globalThis.Array.from()', 23],
];

function eraseFlow() {
  return { visitor: {
    Flow(p) {
      if (p.isTypeCastExpression()) p.replaceWith(p.node.expression);
      else p.remove();
    },
  } };
}

const temporaryRoot = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(temporaryRoot);
const directory = await fs.mkdtemp(path.join(temporaryRoot, 'ambient-binding-'));
let index = 0;
try {
  for (const [name, dialect, declaration, expression, expected] of rows) {
    const filename = dialect === 'flow' ? 'input.js' : 'input.ts';
    const options = { filename, configFile: false, babelrc: false, parserOpts: { plugins: [dialect] } };
    const source = `${ declaration } export const effects = []; export const r = ${ expression };`;
    const outputs = [['native', source]];
    for (const method of ['usage-global', 'usage-pure']) {
      const pluginOptions = { method, version: '4.0', targets: { ie: 11 } };
      outputs.push([`babel/${ method }`, (await transformAsync(source, { ...options, plugins: [[babelPlugin, pluginOptions]] })).code]);
      if (dialect === 'flow') continue; // unplugin has no Flow parser.
      const plugin = createUnplugin(pluginOptions);
      const pre = plugin.transform(source, filename, 'pre')?.code ?? source;
      const post = plugin.transform(pre, filename, 'post')?.code ?? pre;
      outputs.push([`unplugin/${ method }`, pre], [`pre+post/${ method }`, post]);
    }
    for (const [host, output] of outputs) {
      const code = dialect === 'flow'
        ? (await transformAsync(output, { ...options, plugins: [eraseFlow] })).code
        : stripTypeScriptTypes(output);
      const file = path.join(directory, `case-${ index++ }.mjs`);
      await fs.writeFile(file, code);
      for (const strip of host === 'native' ? [false] : [false, true]) {
        check(`${ name }/${ host }/${ strip ? 'stripped' : 'full' }`, await runInWorker(file, { strip }),
          `OK|${ JSON.stringify(expected) }|[]`);
      }
    }
  }
} finally {
  await fs.remove(directory);
}
finish();

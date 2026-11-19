// Opt-out callers and receiver slots retain native identity through both hosts and repeated passes.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { transformPrePost } from '../unplugin/phase-imports.mjs';
import { importSet } from '../transpiler-differential/harness.mjs';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, checkDeep, finish } = createChecker('opt-out-receivers-runtime');
const tmp = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(tmp);
const dir = await fs.mkdtemp(path.join(tmp, 'opt-out-receivers-'));
let serial = 0;

const cases = [
  [
    'disabled-write',
    '// core-js-disable-next-line\nPromise.resolve = value => ({ custom: value });\nr = Promise.resolve(1);',
    'OK|{"custom":1}|[]',
  ],
  [
    'disabled-delete',
    '// core-js-disable-next-line\ndelete Map.groupBy;\nr = typeof Map.groupBy;',
    'OK|"undefined"|[]',
  ],
  [
    'disabled-call',
    'const nativeResolve = Function("return Promise.resolve")();\nfunction pick({ resolve }) { return reso'
    + 'lve; }\n// core-js-disable-next-line\nr = pick(Promise) === nativeResolve;',
    'OK|true|[]',
  ],
  [
    'disabled-arg',
    'const nativeResolve = Function("return Promise.resolve")();\nr = (({ resolve }) => resolve)(\nPromise '
    + '// core-js-disable-line\n) === nativeResolve;',
    'OK|true|[]',
  ],
  [
    'disabled-init',
    'const nativeResolve = Function("return Promise.resolve")();\nconst { resolve } =\nPromise; // core-js-'
    + 'disable-line\nr = resolve === nativeResolve;',
    'OK|true|[]',
  ],
  [
    'disabled-default',
    'const nativeResolve = Function("return Promise.resolve")();\nfunction pick({ resolve } =\nPromise // c'
    + 'ore-js-disable-line\n) { return resolve; }\nr = pick() === nativeResolve;',
    'OK|true|[]',
  ],
  [
    'disabled-arm',
    'const nativeResolve = Function("return Promise.resolve")();\nconst flag = true; const { resolve } = f'
    + 'lag ?\nPromise // core-js-disable-line\n: Object; r = resolve === nativeResolve;',
    'OK|true|[]',
  ],
  [
    'disabled-loop',
    'const nativeResolve = Function("return Promise.resolve")();\nfor (const { resolve } of [\nPromise // c'
    + 'ore-js-disable-line\n]) { r = resolve === nativeResolve; }',
    'OK|true|[]',
  ],
  [
    'disabled-rest',
    'const nativeResolve = Function("return Promise.resolve")();\nconst { resolve, ...rest } =\nPromise; //'
    + ' core-js-disable-line\nr = resolve === nativeResolve;',
    'OK|true|[]',
  ],
  [
    'disabled-realm',
    'const nativeResolve = Function("return Promise.resolve")();\nconst { Promise: { resolve } } =\nglobalT'
    + 'his; // core-js-disable-line\nr = resolve === nativeResolve;',
    'OK|true|[]',
  ],
  [
    'disabled-optional',
    'const nativeResolve = Function("return Promise.resolve")();\nr = (\n// core-js-disable-next-line\ngloba'
    + 'lThis\n)?.Promise.resolve === nativeResolve;',
    'OK|true|[]',
  ],
  [
    'disabled-in',
    'function pick() { return "resolve"\nin Promise; // core-js-disable-line\n} r = pick();',
    'OK|true|[]',
  ],
  [
    'disabled-realm-arm',
    'const nativeResolve = Function("return Promise.resolve")();\nconst flag = true; const { Promise: { re'
    + 'solve } } = flag ?\nglobalThis // core-js-disable-line\n: self; r = resolve === nativeResolve;',
    'OK|true|[]',
  ],
  [
    'disabled-source-wrapper',
    'const nativeResolve = Function("return Promise.resolve")();\nconst { resolve } = (\nPromise // core-js'
    + '-disable-line\n); r = resolve === nativeResolve;',
    'OK|true|[]',
  ],
  [
    'disabled-sequence',
    'const nativeResolve = Function("return Promise.resolve")();\nconst { resolve } = (effects.push("prefi'
    + 'x"),\nPromise // core-js-disable-line\n); r = resolve === nativeResolve;',
    'OK|true|["prefix"]',
  ],
  [
    'disabled-assignment',
    'const nativeResolve = Function("return Promise.resolve")();\nlet held; const { resolve } = (held =\nPr'
    + 'omise // core-js-disable-line\n); r = [resolve === nativeResolve, held === Function("return Promise")'
    + '()];',
    'OK|[true,true]|[]',
  ],
  [
    'disabled-loop-mixed',
    'const nativeResolve = Function("return Promise.resolve")();\nconst out = []; for (const { resolve } o'
    + 'f [\nPromise, // core-js-disable-line\nPromise\n]) { out.push(resolve === nativeResolve); } r = [out[0]'
    + ', out.length];',
    'OK|[true,2]|[]',
  ],
  [
    'disabled-realm-loop',
    'const nativeResolve = Function("return Promise.resolve")();\nfor (const { Promise: { resolve } } of ['
    + '\nglobalThis // core-js-disable-line\n]) { r = resolve === nativeResolve; }',
    'OK|true|[]',
  ],
  [
    'disabled-call-mixed',
    'const nativeResolve = Function("return Promise.resolve")();\nfunction pick({ resolve }) { return reso'
    + 'lve; }\n// core-js-disable-next-line\nconst opted = pick(Promise) === nativeResolve;\nr = [opted, typeo'
    + 'f pick(Promise)];',
    'OK|[true,"function"]|[]',
  ],
  [
    'disabled-call-line',
    'const nativeResolve = Function("return Promise.resolve")();\nfunction pick({ resolve }) { return reso'
    + 'lve; }\nr = pick(Promise) === nativeResolve; // core-js-disable-line',
    'OK|true|[]',
  ],
  [
    'disabled-property-prefix',
    'const nativeResolve = Function("return Promise.resolve")();\nconst { resolve } = (\nFunction("return 1'
    + '")(), // core-js-disable-line\nPromise); r = typeof resolve;',
    'OK|"function"|[]',
  ],
  [
    'disabled-write-alias',
    'const P = Promise;\n// core-js-disable-next-line\nP.resolve = value => ({ custom: value });\nr = Promis'
    + 'e.resolve(1);',
    'OK|{"custom":1}|[]',
  ],
  [
    'disabled-write-prototype',
    '// core-js-disable-next-line\nMap.prototype.custom = function () { return 17; };\nr = new Map().custom'
    + '();',
    'OK|17|[]',
  ],
  [
    'disabled-mutator',
    '// core-js-disable-next-line\nObject.defineProperty(Promise, "resolve", { value: value => ({ custom: '
    + 'value }), configurable: true });\nr = Promise.resolve(1);',
    'OK|{"custom":1}|[]',
  ],
  [
    'disabled-in-missing',
    'Function("delete globalThis.Promise")();\ntry { r = "resolve"\nin Promise; // core-js-disable-line\n} c'
    + 'atch (e) { r = e.name; }',
    'OK|"ReferenceError"|[]',
  ],
  [
    'disabled-member-call',
    'const nativeResolve = Function("return Promise.resolve")();\nfunction pick(value) { return value.resolve; }\n'
    + '// core-js-disable-next-line\nr = pick(Promise) === nativeResolve;',
    'OK|true|[]',
  ],
  [
    'disabled-member-arg',
    'const nativeResolve = Function("return Promise.resolve")();\nr = (value => value.resolve)(\n'
    + 'Promise // core-js-disable-line\n) === nativeResolve;',
    'OK|true|[]',
  ],
];

try {
  for (const [name, body, expected] of cases) {
    const source = scenarioSource(`export let r; export const effects = [];\n${ body }`);
    for (const method of ['usage-global', 'usage-pure']) {
      const options = { method, version: '4.0', targets: { ie: 11 } };
      async function transform(code) {
        return (await transformAsync(code, {
          filename: 'input.mjs', configFile: false, babelrc: false, plugins: [[babelPlugin, options]],
        })).code;
      }
      const babel = await transform(source);
      const single = createUnplugin(options).transform(source, 'input.mjs')?.code ?? source;
      const post = transformPrePost(createUnplugin(options), source, 'input.mjs')?.code ?? source;
      checkDeep(`${ name }/${ method }/phase imports`, [...importSet(post)].sort(), [...importSet(single)].sort());
      for (const [host, output] of [['native', source], ['babel', babel], ['babel-twice', await transform(babel)], ['unplugin', single], ['pre+post', post]]) {
        if (host === 'native' && method === 'usage-pure') continue;
        const file = path.join(dir, `case-${ serial++ }.mjs`);
        await fs.outputFile(file, output);
        check(`${ name }/${ method }/${ host }/full`, await runInWorker(file, { strip: false }), expected);
        const needsRealm = ['disabled-realm', 'disabled-optional', 'disabled-realm-arm', 'disabled-realm-loop', 'disabled-in-missing'].includes(name);
        // Global injection also serves the live pattern on another line; pure leaves the disabled root native.
        const globalReadsRealm = method === 'usage-global' && host !== 'native'
          && ['disabled-realm', 'disabled-realm-arm', 'disabled-realm-loop'].includes(name);
        check(`${ name }/${ method }/${ host }/stripped`,
          await runInWorker(file), needsRealm && !globalReadsRealm ? 'ERR|ReferenceError' : expected);
        if (needsRealm) check(`${ name }/${ method }/${ host }/stripped with native root`,
          await runInWorker(file, { stripGlobals: ['Iterator'] }), expected);
      }
    }
  }
} finally { await fs.remove(dir); }

// A reused plugin instance restores each file's directive context around the prepass.
const reused = createUnplugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
const disabledWrite = '// core-js-disable-next-line\nPromise.resolve = custom;\nPromise.resolve(1);';
for (let pass = 0; pass < 2; pass++) {
  const native = reused.transform(disabledWrite, 'disabled.mjs')?.code ?? disabledWrite;
  check(`reused/${ pass }/disabled constructor`, importSet(native).size, 0);
  const live = reused.transform('Promise.resolve(1);', 'live.mjs').code;
  check(`reused/${ pass }/live constructor`, [...importSet(live)].some(name => name.includes('/promise/')), true);
}
finish();

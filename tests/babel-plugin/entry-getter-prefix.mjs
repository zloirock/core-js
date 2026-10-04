// Entry-global has no runtime e2e lane: compare the removed require's prefix against native
// directly, under both bindings. Each evaluation has a fresh realm and an inert module loader.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createPlugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { createChecker } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformSync } = requireBabel('@babel/core');
const { check, checkDeep, finish } = createChecker('entry-getter-prefix');
const ENTRY = "'core-js/actual/array/from'";
const OPTIONS = ['entry-global', 'usage-global', 'usage-pure'].flatMap(method => [{ ie: 11 }, { chrome: 130 }].map(targets => ({ method, version: '4.0', targets })));
const SOURCE = `const log = [];
function record(value) { log[log.length] = value; }
const box = { get first() { record('first'); return 0; },
  get second() { record('second'); return 0; }, quiet: 0 };
`;

for (const [label, entry, expected] of [
  ['getter', `(box.first, require)(${ ENTRY });`, ['first']],
  ['nested callee getters', `(box.first, (box.second, require))(${ ENTRY });`, ['first', 'second']],
  ['outer and callee getters', `box.first, (box.second, require)(${ ENTRY });`, ['first', 'second']],
  ['optional getter', `(box.first, require)?.(${ ENTRY });`, ['first']],
  ['quiet data', `(box.quiet, require)(${ ENTRY });`, []],
  ['directive terminator', `(({ get first() { log[log.length] = 'first'; return 0; } }).first, require)(${ ENTRY });\n'use strict';`, ['first']],
]) {
  const source = `${ label === 'directive terminator' ? '' : SOURCE }${ entry }\nlog;`;
  const native = Array.from(runInNewContext(source, { require: () => undefined, log: [] }));
  checkDeep(`${ label }/native`, native, expected);
  for (const options of OPTIONS) {
    const { method, targets } = options;
    const input = method === 'entry-global' ? source : source.replace('actual/array/from', 'modules/es.array.from');
    // eslint-disable-next-line node/no-sync -- synchronous native/output comparison
    const babel = transformSync(input, {
      plugins: [[babelPlugin, options]], filename: '/entry.cjs', sourceType: 'script',
      configFile: false, babelrc: false,
    }).code;
    const unplugin = createPlugin(options).transform(input, '/entry.cjs')?.code ?? input;
    for (const [host, code] of [['babel', babel], ['unplugin', unplugin]]) {
      const row = `${ method }/${ Object.keys(targets)[0] }/${ host }/${ label }`;
      checkDeep(`${ row }/getter log`, Array.from(runInNewContext(code, { require: () => undefined, log: [] })), native);
      if (method !== 'usage-pure') {
        check(`${ row }/entry removed`, /,\s*require\s*\)+\s*(?:\?\.)?\(/u.test(code), false);
        if (label === 'quiet data') check(`${ row }/quiet prefix removed`, /box\.quiet/u.test(code), false);
      }
    }
  }
}

finish();

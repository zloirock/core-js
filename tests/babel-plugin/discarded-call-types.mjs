// Return-type stamps serve consumers of a replaced call's value. A discarded value
// must not pay for that query; retained values must still carry their receiver family.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, checkTruthy, finish } = createChecker('discarded-call-types');

for (const [source, retained] of [
  ['rows.at(0);', false],
  ['void rows.at(0);', false],
  ['typeof rows.at(0);', false],
  ['if (rows.at(0)) {}', false],
  ['rows.at(0) === null;', false],
  ['(rows.at(0), 0);', false],
  ['(rows.at(0) as number[]);', false],
  ['rows.at?.(0);', false],
  ['Array.from(rows);', false],
  ['consume(rows.at(0));', true],
  ['export const result = rows.at(0).at(0);', true],
  ['export const result = Array.from(rows).at(0);', true],
]) {
  let queries = 0;
  const { code } = await transformAsync(`const rows = [[1]]; ${ source }`, {
    configFile: false, babelrc: false, filename: 'input.ts', parserOpts: { plugins: ['typescript'] },
    plugins: [[(api, options) => babelPlugin(Object.assign(Object.create(api), {
      types: {
        ...api.types,
        // This predicate observes call-result inference without changing any verdict.
        // Retained-call controls below fail if the counter stops reaching that analysis.
        isImport(node, ...args) {
          if (['at', 'from'].includes(node?.property?.name)) queries++;
          return api.types.isImport(node, ...args);
        },
      },
    }), options), { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  if (retained) checkTruthy(`${ source }: retained result is typed`, queries > 0, `${ queries } queries`);
  else check(`${ source }: discarded result is not typed`, queries, 0);
  checkTruthy(`${ source }: polyfill remains injected`, code.includes('@core-js/pure'));
  check(`${ source }: receiver family stays specific`, code.includes('/actual/instance/at'), false);
}
finish();

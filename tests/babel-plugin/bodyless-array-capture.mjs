// Declaring capture refs can brace a loop before its assignment is replaced. The
// finished body needs one block; blocks explicitly written by the author stay intact.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('bodyless-array-capture');

const hosts = [
  ['for-of', 'for (const item of rows)', ''],
  ['for-in', 'for (const key in rows)', ''],
  ['for', 'for (let index = 0; index < count; index++)', ''],
  ['while', 'while (condition)', ''],
  ['do-while', 'do', 'while (condition);'],
  ['if', 'if (condition)', ''],
  ['labeled loop', 'outer: for (const item of rows)', ''],
];

for (const method of ['usage-pure', 'usage-global']) {
  for (const [name, prefix, suffix] of hosts) for (const braced of [false, true]) {
    const assignment = '[{ flat: selected }] = [source];';
    const body = braced ? `{ { ${ assignment } } }` : assignment;
    const { ast, code } = await transformAsync(`let selected; ${ prefix } ${ body } ${ suffix }`, {
      ast: true,
      configFile: false,
      babelrc: false,
      filename: 'input.mjs',
      plugins: [[babelPlugin, { method, version: '4.0', targets: { ie: 11 } }]],
    });
    let control = ast.program.body.at(-1);
    if (control.type === 'LabeledStatement') control = control.body;
    const block = control.type === 'IfStatement' ? control.consequent : control.body;
    const label = `${ method }: ${ name }: source blocks ${ braced ? 2 : 0 }`;
    const entry = method === 'usage-pure' ? '@core-js/pure/actual/array/instance/flat' : 'core-js/modules/es.array.flat';
    check(`${ label }: polyfill stays live`, code.includes(entry), true);
    check(
      `${ label }: body shape`,
      block.type,
      braced || method === 'usage-pure' ? 'BlockStatement' : 'ExpressionStatement',
    );
    if (block.type === 'BlockStatement') {
      check(`${ label }: only source nesting remains`, block.body.some(node => node.type === 'BlockStatement'), braced);
    }
  }
}

finish();

// Consuming a member must preserve the complete lexical comment sequence, including nested calls.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createChecker } from '../polyfill-provider/harness.mjs';
import plugin from '../../packages/core-js-babel-plugin/index.js';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { parseAsync, transformAsync } = requireBabel('@babel/core');
const { checkDeep, check, finish } = createChecker('consumed-member-comments');
const config = { filename: 'input.mjs', configFile: false, babelrc: false };
async function signature(source) {
  return (await parseAsync(source, config)).comments.map(({ type, value }) => [type, value]);
}
check('missing comment detector', (await signature('Array /* a */.from([])')).length === (await signature('Array.from([])')).length, false);
check('reordered comment detector', JSON.stringify(await signature('x /* a */ /* b */')) === JSON.stringify(await signature('x /* b */ /* a */')), false);

for (const source of [
  'Array /* a */ . /* b */ from /* c */ (/* arg */ [1]);',
  'globalThis /* a */ . /* b */ Array /* c */ . /* d */ from /* e */ ([1]);',
  '[1] /* a */ . /* b */ at /* c */ (/* arg */ 0);',
  '[1] /* a */ . /* b */ slice(0) /* c */ . /* d */ at /* e */ (0);',
  'list /* a */ ?. /* b */ at /* c */ (/* arg */ 0);',
  'Array /* a */ [/* b */ "from" /* c */](/* arg */ [1]);',
  '[1] /* a */ [/* b */ "at" /* c */](/* arg */ 0);',
  '[1][Symbol.iterator](/* inner */);',
  "Array['fr' /* key */ + 'om']([1]);",
  "[1]['a' /* key */ + 't'](0);",
  "Array[(() => /* key */ 'from')()]([1]);",
  '(() => /* receiver */ Array)().from([1]);',
  "Array /* receiver */ [/* effect */ effect(), /* key */ 'from']([1]);",
  "[1] /* receiver */ [/* effect */ effect(), /* key */ 'at'](0);",

]) for (const parens of [false, true]) for (const method of ['usage-global', 'usage-pure']) {
  let output = `(/* head */ 0, ${ source.slice(0, -1) } /* tail */);`;
  const expected = await signature(output);
  for (let pass = 1; pass <= 2; pass++) {
    output = (await transformAsync(output, {
      ...config, parserOpts: { createParenthesizedExpressions: parens },
      plugins: [[plugin, { method, version: '4.0', targets: { ie: 11 } }]],
    })).code;
    checkDeep(`${ method }: parens ${ parens }: pass ${ pass }: ${ source }`, await signature(output), expected);
  }
}
finish();

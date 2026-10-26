// Class, block-scope and pattern lowering can empty a recorded assignment path before
// the program-exit usage sweep. The live replacement writes must remain visible.
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const traverseModule = requireBabel('@babel/traverse');
const traverse = traverseModule.default ?? traverseModule;
const { check, checkTruthy, finish } = createChecker('removed-write-co-transform');
const plugin = new URL('../../packages/core-js-babel-plugin/index.js', import.meta.url).pathname;
const lowerings = ['classes', 'destructuring', 'block-scoping']
  .map(name => requireBabel.resolve(`@babel/plugin-transform-${ name }`));

for (const method of ['usage-global', 'usage-pure']) {
  const source = await readFile(new URL(`../transpiler-fixtures/${ method }/loop-destructure-sibling-lowering/input.mjs`, import.meta.url), 'utf8');
  const { code, ast } = await transformAsync(source, {
    filename: 'input.mjs',
    babelrc: false,
    configFile: false,
    ast: true,
    plugins: [[plugin, { method, version: '4.0', targets: { ie: 11 } }], ...lowerings],
  });
  let declarations = 0;
  traverse(ast, { VariableDeclarator(path) {
    if (path.node.id.type === 'Identifier' && path.node.id.name === 'val') declarations++;
  } });
  check(`${ method } class lowering ran`, code.includes('class DocTypeReader'), false);
  check(`${ method } loop-local binding survived`, declarations, 1);
  checkTruthy(`${ method } lowered iteration is served`, code.includes(method === 'usage-pure'
    ? '@core-js/pure/actual/array/from' : 'core-js/modules/es.array.from'));
}

finish();

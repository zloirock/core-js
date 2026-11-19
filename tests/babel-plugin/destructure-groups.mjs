import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import { groupNativeDeclarators } from '../../packages/core-js-babel-plugin/internals/destructure-emission-plan.js';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('babel declarator adjacency');
const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync, types: t } = requireBabel('@babel/core');

runBoth('deferred declaration groups', 'const memo = receiver, first = 1, { other } = memo, last = 2;',
  (parser, program, label) => {
    const declaration = parser.pickPath(program, 'VariableDeclaration').node;
    const [memo, first, residual, last] = declaration.declarations;
    const { declarations } = declaration;
    function names(groups) { return groups.map(group => group.map(item => declarations.indexOf(item))); }
    const memos = new WeakSet([memo]);
    checkDeep(`${ label }/split`, names(groupNativeDeclarators(declarations)), [[0], [1], [2], [3]]);
    checkDeep(`${ label }/pending visits`, names(groupNativeDeclarators(declarations, { keepPatterns: true })), [[0, 1, 2, 3]]);
    checkDeep(`${ label }/capture group`, names(groupNativeDeclarators(declarations, { memos, slotHost: residual })), [[0], [1, 2, 3]]);
    checkDeep(`${ label }/whole capture`, names(groupNativeDeclarators(declarations, {
      memos, wholeInit: new WeakSet([residual]),
    })), [[0], [1], [2, 3]]);
    const attached = new WeakSet([first, last]);
    checkDeep(`${ label }/attached`, names(groupNativeDeclarators(declarations, { memos, attached })), [[0, 1], [2, 3]]);
    checkDeep(`${ label }/pruned capture`, names(groupNativeDeclarators(declarations, { memos, attached, pruned: residual })),
      [[0], [1], [2, 3]]);
    check(`${ label }/identity retained`, declaration.declarations, declarations);
  });

// A nested default follows source order; only a leading extraction may precede the residual.
for (const preceding of [false, true]) {
  const source = `exports.Array = Array;
    const { ${ preceding ? 'isArray, ' : '' }prototype: { at = fallback() }${ preceding ? '' : ', isArray' } } = this.Array;`;
  const { ast } = await transformAsync(source, {
    filename: 'input.cjs', sourceType: 'script', configFile: false, babelrc: false, ast: true,
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  const bindings = ast.program.body.flatMap(statement => statement.type === 'VariableDeclaration'
    ? statement.declarations.flatMap(item => Object.keys(t.getBindingIdentifiers(item.id))) : []);
  checkDeep(`nested default / preceding=${ preceding }`, bindings.filter(name => name === 'at' || name === 'isArray'),
    preceding ? ['isArray', 'at'] : ['at', 'isArray']);
}

finish();

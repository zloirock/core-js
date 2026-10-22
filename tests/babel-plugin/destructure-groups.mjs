import { groupNativeDeclarators } from '../../packages/core-js-babel-plugin/internals/destructure-emission-plan.js';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('babel declarator adjacency');

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

finish();

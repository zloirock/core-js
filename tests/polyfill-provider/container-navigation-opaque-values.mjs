// A value that the receiver walk follows must also enter the mutation census. A write that can
// reach such a value does not prove the initial value dead.
import {
  canHoldBuiltIn,
  noReassignmentReachesUsage,
  reassignmentDominatesUsage,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { adapters, createChecker } from './harness.mjs';

const { check, finish } = createChecker('container-navigation-opaque-values');

const values = [
  ['bare constructor', 'Array', true],
  ['realm navigation', 'globalThis.Array', true],
  ['optional navigation', 'globalThis?.Array', true],
  ['computed navigation', 'globalThis["Map"]', true],
  ['asserted navigation', '(globalThis.Array as any)', true],
  ['sequence navigation', '(effect(), globalThis.Array)', true],
  ['stored navigation', '(saved = globalThis.Map)', true],
  ['object container', '({ base: Array })', true],
  ['nested array container', '[Array]', true],
  ['class container', '(class { static base = Array; })', true],
  ['number data', '1', false],
  ['string data', '"Array"', false],
  ['null data', 'null', false],
  ['asserted data', '(1 as any)', false],
  ['sequence data', '(effect(), 1)', false],
  ['unknown call', 'factory()', false],
];

const accesses = [
  ['definite write', 'o = other; o.host.from([]);', 'AssignmentExpression', true, false],
  ['conditional write', 'if (flag) o = other; o.host.from([]);', 'AssignmentExpression', false, false],
  ['write after', 'o.host.from([]); o = other;', 'AssignmentExpression', false, true],
];

let checked = 0;
for (const adapter of adapters) {
  for (const [name, value, expected] of values) {
    const program = adapter.parseAndScope(`let saved; const slot = ${ value };`);
    const slot = adapter.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'slot');
    check(`${ adapter.name }: ${ name }`, canHoldBuiltIn(slot.node.init), expected);
    checked++;
  }
  for (const [name, body, type, dominates, preserved] of accesses) {
    const program = adapter.parseAndScope(`var o = { host: Array }; ${ body }`, 'script');
    const usagePath = adapter.pickPath(program, 'MemberExpression', path => path.node.property.name === 'from');
    const reassignmentNodes = adapter.collectPaths(program, type).map(path => path.node);
    check(`${ adapter.name }: ${ name } has one access`, reassignmentNodes.length, 1);
    check(`${ adapter.name }: ${ name } proves overwrite`,
      reassignmentDominatesUsage({ reassignmentNodes, usagePath }), dominates);
    check(`${ adapter.name }: ${ name } preserves certainty`,
      noReassignmentReachesUsage({ reassignmentNodes, usagePath }), preserved);
    checked += 3;
  }
}
check('all rows were checked', checked, adapters.length * (values.length + accesses.length * 3));
check('the suite keeps its coverage floor', checked >= 50, true);
finish();

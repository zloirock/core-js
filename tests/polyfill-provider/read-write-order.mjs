// A source span ranks evaluations only inside the same synchronous slot and frame.
import {
  aliasSlotWritten,
  readRunsBeforeWrites,
  reassignmentValueEnumeration,
  useOutrunsWrite,
  writeOutrunsUse,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('read-write-order');

for (const [label, source, outruns, precedes] of [
  ['update after body', 'for (; test; use(value)) { value = next; }', true, false],
  ['update after unbraced body', 'for (; test; use(value)) value = next;', true, false],
  ['test before body', 'for (; use(value);) { value = next; }', false, true],
  ['init before body', 'for (use(value); test;) { value = next; }', false, true],
  ['read before write inside update', 'for (; test; use(value), value = next) {}', false, true],
  ['write before read inside update', 'for (; test; value = next, use(value)) {}', false, false],
  ['body before update write', 'for (; test; value = next) { use(value); }', false, false],
  ['outside before loop', 'use(value); for (; test;) { value = next; }', false, true],
]) runBoth(label, `let value; ${ source }`, (parser, program, row) => {
  const use = parser.pickPath(program, 'CallExpression');
  const write = parser.pickPath(program, 'AssignmentExpression').node;
  check(`${ row }/early slot`, writeOutrunsUse(write, use), outruns);
  check(`${ row }/memoized early slot`, writeOutrunsUse(write, use), outruns);
  check(`${ row }/first read before writes`, readRunsBeforeWrites({ readNode: use.node, anchorPath: use, writes: [write] }), precedes);
  check(`${ row }/late slot`, useOutrunsWrite(write, use), label === 'body before update write');
});

for (const [label, tail, names] of [
  ['ordinary later write', 'value = Promise;', []],
  ['hoisted writer', 'function init() { value = Promise; }', ['Promise']],
  ['block inside hoisted writer', 'function init() { { value = Promise; } }', ['Promise']],
  ['later class cannot write yet', 'class C { field = (value = Promise); }', []],
  ['field in hoisted writer', 'function init() { class C { field = (value = Promise); } new C(); }', ['Promise']],
]) runBoth(label, `let value = null; init(); use(value); ${ tail }`, (parser, program, row) => {
  const declaration = parser.pickPath(program, 'VariableDeclarator');
  const usagePath = parser.pickPath(program, 'CallExpression', path => path.node.callee.name === 'use');
  const writes = parser.collectPaths(program, 'AssignmentExpression').map(path => path.node);
  const binding = { node: declaration.node, declarationPath: declaration, scope: { block: program.node }, constantViolations: writes };
  const result = reassignmentValueEnumeration({ binding, usagePath, name: 'value', countDeadWrites: true });
  checkDeep(row, result.nodes.map(node => node.name), names);
  check(`${ row }/complete`, result.complete, true);
});

// Mutation facts are mode-independent. The caller decides whether it needs proof or candidates.
for (const method of ['usage-global', 'usage-pure']) {
  let asked = null;
  const path = { node: { type: 'Identifier', name: 'read' } };
  const ownerNode = { type: 'VariableDeclarator' };
  const adapter = { method, isWrittenContainerSlot(...args) {
    asked = args;
    return true;
  } };
  check(`${ method }/written alias`, aliasSlotWritten({ type: 'Identifier', name: 'box' }, ['items', 0], adapter, { path, ownerNode }), true);
  checkDeep(`${ method }/slot identity`, asked.slice(0, 3), ['box', ['items', '0'], ownerNode]);
  check(`${ method }/read position`, asked[4], path.node);
  check(`${ method }/non-alias`, aliasSlotWritten({ type: 'ObjectExpression', properties: [] }, 'items', adapter), false);
}
check('no mutation adapter', aliasSlotWritten({ type: 'Identifier', name: 'box' }, 'items', null, { scope: {} }), false);

finish();

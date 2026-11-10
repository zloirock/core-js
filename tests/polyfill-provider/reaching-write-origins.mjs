// A rewritten RHS loses its span; reachability belongs to the assignment that installs it.
import { reassignmentValueEnumeration } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('reaching-write-origins');
for (const unknown of [false, true]) runBoth(`rewritten values/${ unknown }`, `function f(test) {
  let value;
  value = stale;
  if (test) value = left; else value = right;
  use(value);
}`, (parser, program, label) => {
  const declaration = parser.pickPath(program, 'VariableDeclarator');
  const owner = parser.pickPath(program, 'FunctionDeclaration');
  const usagePath = parser.pickPath(program, 'CallExpression');
  const since = parser.pickPath(program, 'IfStatement').node;
  const writes = parser.collectPaths(program, 'AssignmentExpression').map(item => item.node);
  for (const write of writes) {
    delete write.right.start;
    delete write.right.end;
  }
  if (unknown) delete writes[0].start;
  const binding = { node: declaration.node, declarationPath: declaration, scope: { block: owner.node }, constantViolations: writes };
  const result = reassignmentValueEnumeration({ binding, usagePath, name: 'value', countDeadWrites: true, since });
  check(`${ label }/complete`, result.complete, true);
  checkDeep(`${ label }/origin determines liveness`, result.nodes.map(node => node.name), unknown ? ['stale', 'left', 'right'] : ['left', 'right']);
});
for (const unknown of [false, true]) runBoth(`replaced iteration value/${ unknown }`, `function f(test) {
  for (let value of [stale]) {
    if (test) value = left; else value = right;
    use(value);
  }
}`, (parser, program, label) => {
  const declaration = parser.pickPath(program, 'VariableDeclarator');
  const owner = parser.pickPath(program, 'FunctionDeclaration');
  const usagePath = parser.pickPath(program, 'CallExpression');
  const since = parser.pickPath(program, 'IfStatement').node;
  const writes = parser.collectPaths(program, 'AssignmentExpression').map(item => item.node);
  if (unknown) delete parser.pickPath(program, 'ForOfStatement').node.start;
  const binding = { node: declaration.node, declarationPath: declaration, scope: { block: owner.node }, constantViolations: writes };
  const result = reassignmentValueEnumeration({ binding, usagePath, name: 'value', countDeadWrites: true, since });
  check(`${ label }/complete`, result.complete, true);
  checkDeep(`${ label }/iteration origin determines liveness`, result.nodes.map(node => node.name), unknown ? ['stale', 'left', 'right'] : ['left', 'right']);
});
finish();

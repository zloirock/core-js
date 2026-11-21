// A rewritten RHS loses its span; reachability belongs to the assignment that installs it.
import { completeBranchWritesBefore, reassignmentValueEnumeration, suspensionPointBefore } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
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
runBoth('only writes to the selected binding complete its branches', `function f(flag) {
  let C;
  if (flag) C = Array; else { let C; C = Array; }
  use(C);
}`, (parser, program, label) => {
  const ownerNode = parser.pickPath(program, 'FunctionDeclaration').node;
  const readNode = parser.pickPath(program, 'CallExpression').node;
  const writes = parser.collectPaths(program, 'AssignmentExpression').map(path => path.node);
  const branch = parser.pickPath(program, 'IfStatement').node;
  function checkWrites(writeNodes) { return completeBranchWritesBefore({ ownerNode, readNode, name: 'C', writeNodes }); }
  check(`${ label }/outer write only`, checkWrites([writes[0]]), null);
  check(`${ label }/both supplied writes`, checkWrites(writes), branch);
});

runBoth('a computed method key suspends its defining function', `async function make() {
  return { [await 0]() {}, async other() { await 1; } };
}`, (parser, program, label) => {
  const owner = parser.pickPath(program, 'FunctionDeclaration').node;
  const [awaitKey, awaitBody] = parser.collectPaths(program, 'AwaitExpression').map(path => path.node);
  const [keyed, other] = owner.body.body[0].argument.properties.map(method => method.value ?? method);
  check(`${ label }/outer body`, suspensionPointBefore(owner, Infinity), awaitKey.start);
  check(`${ label }/key runs outside the method`, suspensionPointBefore(keyed, Infinity), null);
  check(`${ label }/nested body`, suspensionPointBefore(other, Infinity), awaitBody.start);
});
finish();

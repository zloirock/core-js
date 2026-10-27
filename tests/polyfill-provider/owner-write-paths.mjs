// A source write needs its own lexical scope, not a path index over every sibling body.
import {
  buildOwnerWritePathIndex, ownerSourceWritePath, synthHoistedBinding,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { adapters, createChecker } from './harness.mjs';

const { check, checkDeep, checkTruthy, finish } = createChecker('owner-write-paths');

for (const parser of adapters) {
  for (const size of [16, 64]) {
    const program = parser.parseAndScope(`function outer(flag) {
      { const source = "ab"; var held = source; }
      if (flag) held = "ef";
      function inner() { held = "cd"; ${ 'sink(0);'.repeat(size) } }
      return held.at(0);
    }`);
    const [owner] = program.get('body');
    const body = owner.get('body');
    const [declaration] = body.get('body')[0].get('body')[1].get('declarations');
    const label = `${ parser.name }/${ size }`;
    const original = owner.traverse;
    let walks = 0;
    owner.traverse = function (...args) {
      walks++;
      return original.apply(this, args);
    };
    try {
      const binding = synthHoistedBinding(body, 'held');
      const path = binding.resolveDeclaratorPath();
      check(`${ label }/declarator identity`, path.node, declaration.node);
      check(`${ label }/initializer shadow`, path.scope.getBinding('source').path.node.init.value, 'ab');
      check(`${ label }/hoisted owner`, binding.ownerNode, owner.node);
      const writes = binding.resolveViolationPaths();
      checkDeep(`${ label }/complete writes`, writes.map(write => write.node), binding.constantViolations);
      check(`${ label }/write count`, writes.length, 2);
      check(`${ label }/source lookup`, ownerSourceWritePath(owner, declaration.node).node, declaration.node);
      check(`${ label }/no owner walk`, walks, 0);

      // A clone has no exact live path: the index fallback must still be reachable.
      check(`${ label }/clone lookup`, ownerSourceWritePath(owner, { ...declaration.node }).node, declaration.node);
      check(`${ label }/fallback counter control`, walks, 1);
    } finally {
      owner.traverse = original;
    }
  }

  // Every write form retains the scope and ancestry of the original traversal.
  const program = parser.parseAndScope(`function outer(xs, object) {
    { let local = 0; var held; held = local; held++; }
    for (held of xs) {} for (held in object) {}
    function inner() { held = 1; }
  }`);
  const [owner] = program.get('body');
  const statements = owner.get('body').get('body');
  const block = statements[0].get('body');
  const targets = [
    block[1].get('declarations')[0], block[2].get('expression'), block[3].get('expression'),
    statements[1], statements[2], statements[3], statements[3].get('body').get('body')[0].get('expression'),
  ];
  const found = targets.map(path => ownerSourceWritePath(owner, path.node));
  const scopes = found.map(path => path.scope);
  const indexed = buildOwnerWritePathIndex(owner);
  for (const [index, target] of targets.entries()) {
    const label = `${ parser.name }/${ target.node.type }/${ index }`;
    check(`${ label }/node`, found[index].node, target.node);
    check(`${ label }/parent`, found[index].parentPath.node, indexed.get(target.node).parentPath.node);
    check(`${ label }/lexical scope`, scopes[index], indexed.get(target.node).scope);
  }

  const siblings = parser.parseAndScope('function first() { var x = 1; } function second() { var x = 2; }');
  const [first, second] = siblings.get('body');
  const [foreign] = second.get('body').get('body')[0].get('declarations');
  check(`${ parser.name }/a neighbouring owner is not searched`, ownerSourceWritePath(first, foreign.node) === null, true);
  // Native traversals differ on visiting their root; retain their indexed answer.
  check(`${ parser.name }/owner lookup keeps the traversal contract`,
    ownerSourceWritePath(first, first.node)?.node ?? null, buildOwnerWritePathIndex(first).get(first.node)?.node ?? null);

  const spanless = parser.parseAndScope('function outer() { var x = 1; x = 2; }');
  const [spanlessOwner] = spanless.get('body');
  const write = spanlessOwner.get('body').get('body')[1].get('expression');
  delete write.node.start;
  delete write.node.end;
  check(`${ parser.name }/positionless live node`, ownerSourceWritePath(spanlessOwner, write.node).node, write.node);

  // A removed write must not be recovered from a cached navigation path.
  const removed = parser.parseAndScope('function outer() { var x = 1; x = 2; }');
  const [removedOwner] = removed.get('body');
  const removedBody = removedOwner.get('body');
  const removedWrite = removedBody.get('body')[1].get('expression').node;
  checkTruthy(`${ parser.name }/live removal control`, ownerSourceWritePath(removedOwner, removedWrite));
  removedBody.node.body.pop();
  check(`${ parser.name }/detached cached path`, ownerSourceWritePath(removedOwner, removedWrite) === null, true);

  const incomplete = parser.parseAndScope('function outer() { { var x = 1; } x = 2; }');
  const incompleteBody = incomplete.get('body')[0].get('body');
  const binding = synthHoistedBinding(incompleteBody, 'x');
  check(`${ parser.name }/source write control`, binding.constantViolations.length, 1);
  incompleteBody.node.body.pop();
  checkTruthy(`${ parser.name }/remaining declaration`, binding.resolveDeclaratorPath());
  check(`${ parser.name }/missing authoritative write declines the binding`, binding.resolveViolationPaths(), null);
}

finish();

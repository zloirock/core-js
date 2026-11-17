import { flattenArrayWrapperInits, restoreUnclaimedFlattens } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, runBoth, finish } = createChecker('unclaimed-flattens');

// Unclaimed preparation restores the original spread nodes, including nested levels.
// A second program and a repeated call must not consume or resurrect another record.
for (const [pattern, receiver, count] of [
  ['[{ y: { at: a } }]', '[...[nb]]', 1],
  ['[[{ y: { at: a } }]]', '[...[[...[nb]]]]', 2],
  ['[{ items: [{ y: { at: a } }] }]', '[...[{ items: [...[nb]] }]]', 2],
]) runBoth(`restore/${ receiver }`, `function read(${ pattern } = ${ receiver }, b = a) { return b; }`, (parser, program, label) => {
  const other = parser.parseAndScope('function next([{ at: other }] = [...[nb]], b = other) { return b; }');
  const roots = [program, other];
  const props = roots.map(root => parser.pickPath(root, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
    path => path.node.value?.type === 'Identifier'));
  const arrays = roots.map(root => parser.collectPaths(root, 'ArrayExpression').map(path => path.node));
  const original = arrays.map(nodes => nodes.map(node => [...node.elements]));
  const changes = [0, 0];
  for (const [index, prop] of props.entries()) {
    flattenArrayWrapperInits(prop, (path, nodes) => {
      changes[index]++;
      path.replaceWithMultiple(nodes);
    });
  }
  checkDeep(`${ label } prepared`, changes, [count, 1]);
  restoreUnclaimedFlattens(program.node);
  for (const [index, node] of arrays[0].entries()) {
    check(`${ label } array ${ index } length`, node.elements.length, original[0][index].length);
    check(`${ label } array ${ index } identity`, node.elements.every((element, i) => element === original[0][index][i]), true);
  }
  check(`${ label } other program stays prepared`, arrays[1][0].elements[0].type, 'Identifier');
  restoreUnclaimedFlattens(other.node);
  check(`${ label } other restored`, arrays[1][0].elements[0] === original[1][0][0], true);
  restoreUnclaimedFlattens(program.node);
  check(`${ label } idempotent`, arrays[0][0].elements[0] === original[0][0][0], true);
  arrays[0][0].elements.push(original[0][0][0]);
  restoreUnclaimedFlattens(program.node);
  check(`${ label } retired record cannot undo a later edit`, arrays[0][0].elements.length, original[0][0].length + 1);
});

finish();

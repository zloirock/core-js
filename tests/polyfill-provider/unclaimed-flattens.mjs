import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { flattenArrayWrapperInits, prepareDestructureLiteralWrapper, restoreUnclaimedFlattens } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, runBoth, finish } = createChecker('unclaimed-flattens');

for (const kind of ['static', 'instance']) {
  runBoth(`prepare ${ kind } wrapper`, 'const [{ from }] = [...[Array]];', (parser, program, label) => {
    const [declarator] = program.get('body')[0].get('declarations');
    const [propPath] = declarator.get('id').get('elements')[0].get('properties');
    const literal = declarator.get('init').node;
    const keep = kind === 'static';
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    check(`${ label } retained`, prepareDestructureLiteralWrapper({ propPath, kind, adapter }), keep);
    check(`${ label } selected shape`, literal.elements[0].type, keep ? 'SpreadElement' : 'Identifier');
    restoreUnclaimedFlattens(program.node);
    check(`${ label } unclaimed literal`, literal.elements[0].type, 'SpreadElement');
  });
}

// Unclaimed preparation restores the original spread nodes, including nested levels.
// A second program and a repeated call must not consume or resurrect another record.
for (const [pattern, receiver, count] of [
  ['[{ y: { at: a } }]', '[...[nb]]', 1],
  ['[{ y: { at: a } }]', '[...[nb, , 7]]', 0],
  ['[{ y: { at: a } }]', '[...[...[nb, , 7]]]', 0],
  ['[{ y: { at: a } }]', '[...[nb], ...[, 7]]', 1],
  ['[[{ y: { at: a } }]]', '[...[[...[nb]]]]', 2],
  ['[{ items: [{ y: { at: a } }] }]', '[...[{ items: [...[nb]] }]]', 2],
]) runBoth(`restore/${ receiver }`, `function read(${ pattern } = ${ receiver }, b = a) { return b; }`, (parser, program, label) => {
  const other = parser.parseAndScope('function next([{ at: other }] = [...[nb]], b = other) { return b; }');
  const roots = [program, other];
  const props = roots.map(root => parser.pickPath(root, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
    path => path.node.value?.type === 'Identifier'));
  const arrays = roots.map(root => parser.collectPaths(root, 'ArrayExpression').map(path => path.node));
  const original = arrays.map(nodes => nodes.map(node => [...node.elements]));
  for (const prop of props) flattenArrayWrapperInits(prop);
  const changes = arrays.map((nodes, root) => nodes.reduce((sum, node, i) => sum + original[root][i]
    .filter(element => element?.type === 'SpreadElement' && !node.elements.includes(element)).length, 0));
  checkDeep(`${ label } prepared`, changes, [count, 1]);
  restoreUnclaimedFlattens(program.node);
  for (const [index, node] of arrays[0].entries()) {
    check(`${ label } array ${ index } length`, node.elements.length, original[0][index].length);
    check(`${ label } array ${ index } identity`, node.elements.every((element, i) => element === original[0][index][i]), true);
  }
  check(`${ label } other program stays prepared`, arrays[1][0].elements[0].type, 'Identifier');
  flattenArrayWrapperInits(props[0]);
  restoreUnclaimedFlattens(program.node);
  check(`${ label } repeat pass`, arrays[0][0].elements.every((element, i) => element === original[0][0][i]), true);
  restoreUnclaimedFlattens(other.node);
  check(`${ label } other restored`, arrays[1][0].elements[0] === original[1][0][0], true);
  restoreUnclaimedFlattens(program.node);
  check(`${ label } idempotent`, arrays[0][0].elements[0] === original[0][0][0], true);
  arrays[0][0].elements.push(original[0][0][0]);
  restoreUnclaimedFlattens(program.node);
  check(`${ label } retired record cannot undo a later edit`, arrays[0][0].elements.length, original[0][0].length + 1);
});

// A visitor can retain a sibling path or replace another array element between
// preparation and file exit. Both changes must survive restoration in the same traversal.
for (const [source, flatIndex] of [
  ['...[], seed, tail', 1], ['seed, ...[], tail', 1], ['seed, ...[], ...[], tail', 1],
  ['seed, ...[], , tail', 2], ['seed, ...[x, y], tail', 3], ['seed, ...[...[x, y]], tail', 3],
  ['seed, ...[x, , y], tail', 2], ['seed, ...[x, y], tail, ...[]', 3],
]) runBoth(`retained sibling/${ source }`, `function read([{ at }] = [${ source }]) { return at; }`, (parser, program, label) => {
  const [param] = program.get('body')[0].get('params');
  const [prop] = param.get('left').get('elements')[0].get('properties');
  const array = param.get('right');
  const original = [...array.node.elements];
  const tail = array.get('elements').find(path => path.node?.name === 'tail');
  const index = tail.key;
  flattenArrayWrapperInits(prop);
  check(`${ label } prepared index`, tail.key, flatIndex);
  const changed = { type: 'Identifier', name: 'changed' };
  tail.replaceWith(changed);
  const live = array.get('elements')[flatIndex];
  restoreUnclaimedFlattens(program.node);
  check(`${ label } restored index`, live.key, index);
  check(`${ label } preserved edit`, live.container[live.key], changed);
  check(`${ label } restored length`, array.node.elements.length, original.length);
  check(`${ label } other original elements`, original.every((node, i) => i === index || array.node.elements[i] === node), true);
  live.replaceWith({ type: 'Identifier', name: 'last' });
  check(`${ label } next visit`, array.node.elements[index].name, 'last');
});

runBoth('empty spread next to a hole', 'function read([{ at }] = [seed, , ...[], tail]) { return at; }', (parser, program, label) => {
  const [param] = program.get('body')[0].get('params');
  const array = param.get('right');
  const spread = array.node.elements.at(-2);
  flattenArrayWrapperInits(param.get('left').get('elements')[0].get('properties')[0]);
  array.unshiftContainer('elements', [{ type: 'Identifier', name: 'head' }]);
  array.get('elements').at(-1).replaceWith({ type: 'Identifier', name: 'changed' });
  restoreUnclaimedFlattens(program.node);
  checkDeep(`${ label } restored order`, array.node.elements.map(node => node?.name ?? node?.type ?? null),
    ['head', 'seed', null, 'SpreadElement', 'changed']);
  check(`${ label } original spread`, array.node.elements[3], spread);
});

runBoth('edited expansion', 'function read([{ at }] = [...[x, y], ...[a, b]]) { return at; }', (parser, program, label) => {
  const [param] = program.get('body')[0].get('params');
  const array = param.get('right');
  const [, other] = array.node.elements;
  flattenArrayWrapperInits(param.get('left').get('elements')[0].get('properties')[0]);
  array.get('elements')[1].replaceWith({ type: 'Identifier', name: 'changed' });
  restoreUnclaimedFlattens(program.node);
  checkDeep(`${ label } edited run`, array.node.elements.map(node => node.name ?? node.type), ['x', 'changed', 'SpreadElement']);
  check(`${ label } intact run`, array.node.elements[2], other);
});

for (const method of ['pureImports', 'globalImports']) {
  runBoth(`claimed ${ method }`, 'function read([{ at }] = [...[x, y]]) { return at; }', (parser, program, label) => {
    const [param] = program.get('body')[0].get('params');
    const [prop] = param.get('left').get('elements')[0].get('properties');
    const array = param.get('right');
    const [original] = array.node.elements;
    const injector = { pureImports: new Set(), globalImports: new Set() };
    injector[method].add('entry');
    flattenArrayWrapperInits(prop);
    restoreUnclaimedFlattens(program.node, injector);
    restoreUnclaimedFlattens(program.node);
    checkDeep(`${ label } retired edit`, array.node.elements.map(node => node.name), ['x', 'y']);
    const added = structuredClone(original);
    array.pushContainer('elements', [added]);
    flattenArrayWrapperInits(prop);
    checkDeep(`${ label } new pass`, array.node.elements.map(node => node.name), ['x', 'y', 'x', 'y']);
    restoreUnclaimedFlattens(program.node);
    check(`${ label } only later spread restored`, array.node.elements[2], added);
  });
}

const singletonSpreads = Array.from({ length: 32 }, (_, i) => `...[x${ i }]`).join(', ');
runBoth('reuse inserted paths', `function read([{ at }] = [${ singletonSpreads }]) { return at; }`, (parser, program, label) => {
  const [param] = program.get('body')[0].get('params');
  const array = param.get('right');
  flattenArrayWrapperInits(param.get('left').get('elements')[0].get('properties')[0]);
  const get = array.get.bind(array);
  let listReads = 0;
  array.get = key => {
    if (key === 'elements') listReads++;
    return get(key);
  };
  restoreUnclaimedFlattens(program.node);
  check(`${ label } intact paths need no list scan`, listReads, 0);
  check(`${ label } all spreads restored`, array.node.elements.filter(node => node.type === 'SpreadElement').length, 32);
});

finish();

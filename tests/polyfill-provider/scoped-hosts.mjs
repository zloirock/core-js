// Host edits preserve live paths, and invocation timing follows semantic function kinds.
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { pruneHopFromLevels } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { realmSelectingHostCollapses } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { bodyRunsAtInvocation, FUNCTION_LIKE_NODE_TYPES } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { adapters, createChecker } from './harness.mjs';

const { check, checkDeep, checkTruthy, finish } = createChecker('scoped-hosts');
for (const parser of adapters) {
  for (const [name, source, constructs, calls = true] of [
    ['declaration', 'function A() {}', true],
    ['expression', 'const A = function () {};', true],
    ['arrow', 'const A = () => {};', false],
    ['async declaration', 'async function A() {}', false, false],
    ['generator declaration', 'function* A() {}', false, false],
    ['async expression', 'const A = async function () {};', false, false],
    ['generator expression', 'const A = function* () {};', false, false],
    ['constructor', 'class A { constructor() {} }', true, false],
    ['class method', 'class A { m() {} }', false],
    ['static method', 'class A { static m() {} }', false],
    ['private method', 'class A { #m() {} }', false],
    ['object method', 'const o = { m() {} };', false],
    ['function property', 'const o = { m: function () {} };', true],
    ['get accessor', 'const o = { get m() {} };', false],
    ['set accessor', 'const o = { set m(x) {} };', false],
    ['class getter', 'class A { get m() {} }', false],
    ['async method', 'const o = { async m() {} };', false, false],
    ['generator method', 'const o = { *m() {} };', false, false],
  ]) {
    const tree = parser.parseAndScope(source);
    let fn;
    for (const type of FUNCTION_LIKE_NODE_TYPES) fn ??= parser.pickPath(tree, type);
    checkTruthy(`${ parser.name }/${ name }/function found`, fn);
    check(`${ parser.name }/${ name }/new`, bodyRunsAtInvocation(fn.node, { type: 'NewExpression' }, fn.parentPath?.node), constructs);
    check(`${ parser.name }/${ name }/call`, bodyRunsAtInvocation(fn.node, { type: 'CallExpression' }, fn.parentPath?.node), calls);
    check(`${ parser.name }/${ name }/tag`, bodyRunsAtInvocation(fn.node, { type: 'TaggedTemplateExpression' }, fn.parentPath?.node), calls);
  }
  for (const removed of [0, 1, 2]) for (const spans of [true, false]) {
    const tree = parser.parseAndScope('const { a, b, c } = source;');
    const pattern = parser.pickPath(tree, 'ObjectPattern');
    const paths = pattern.get('properties');
    const nodes = [...pattern.node.properties];
    if (!spans) for (const node of [pattern.node, ...nodes]) {
      delete node.start;
      delete node.end;
    }
    const split = { hopProp: nodes[removed], chain: [{ pattern: pattern.node }] };
    let removals = 0;
    pruneHopFromLevels(split, (node, index) => {
      check(`${ parser.name }/remove ${ removed }/${ spans }/exact pattern`, node, pattern.node);
      removals++;
      pattern.get('properties')[index].remove();
    });
    check(`${ parser.name }/remove ${ removed }/${ spans }/binding used`, removals, 1);
    const survivors = paths.filter((_, at) => at !== removed);
    checkDeep(`${ parser.name }/remove ${ removed }/${ spans }/indices`, survivors.map(item => item.key), [0, 1]);
    survivors[0].remove();
    check(`${ parser.name }/remove ${ removed }/${ spans }/later removal`, pattern.node.properties[0], survivors[1].node);
    pruneHopFromLevels(split, () => { removals++; });
    check(`${ parser.name }/remove ${ removed }/${ spans }/absent hop`, removals, 1);
  }
  for (const wrap of [value => value, value => `(${ value })`, value => `(((${ value })))`, value => `(${ value } as any)`]) {
    for (const shape of ['declaration', 'assignment', 'array']) for (const realm of [true, false]) {
      const receiver = wrap(`flag ? globalThis : ${ realm ? 'globalThis' : 'other' }`);
      const source = shape === 'declaration' ? `const { Math: M } = ${ receiver };`
        : shape === 'assignment' ? `let M; ({ Math: M } = ${ receiver });`
          : `const [{ Math: M }] = ${ wrap(`[${ receiver }]`) };`;
      const tree = parser.parseAndScope(source);
      const host = parser.pickPath(tree, shape === 'assignment' ? 'AssignmentExpression' : 'VariableDeclarator',
        item => shape === 'assignment' || !!item.node.init);
      const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
      const ctx = { adapter, scope: host.scope, path: host };
      const before = JSON.stringify(host.node);
      const sites = realmSelectingHostCollapses(host.node, ctx);
      check(`${ parser.name }/${ shape }/${ receiver }/collapse`, sites.length, realm ? 1 : 0);
      for (const site of sites) check(`${ parser.name }/${ shape }/original slot`, site.container[site.key], site.init);
      check(`${ parser.name }/${ shape }/read only`, JSON.stringify(host.node), before);
      adapter.method = 'usage-global';
      check(`${ parser.name }/${ shape }/global`, realmSelectingHostCollapses(host.node, ctx).length, 0);
    }
  }
}
finish();

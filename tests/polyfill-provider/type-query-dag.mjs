// Repeated type branches preserve their answers without enumerating every path through a DAG.
import { adapters, babelAdapter, createChecker } from './harness.mjs';
import { createTypeQueryCache } from '../../packages/core-js-polyfill-provider/resolve-node-type/type-query-cache.js';
import { withCanonQuestion, withReentrantQuestion } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { compositeAnnotationOf } from '../../packages/core-js-polyfill-provider/resolve-node-type/ast-shapes.js';

const { check, checkDeep, finish } = createChecker('type-query-dag');

function typeDagSource(shape, size) {
  const conditional = shape.startsWith('conditional');
  const first = conditional ? shape.endsWith('member') ? '{ list: number[] }' : 'number[]'
    : shape === 'element' ? 'number[][]' : shape.startsWith('awaited') ? 'Promise<{ list: number[] }>'
      : shape === 'closed' ? '{ a: 1 }' : '{ list: number[] }';
  const second = shape === 'closed' ? '{ b: 1 }' : first;
  const lines = conditional ? [`type C0<T> = ${ first };`] : [`type C0 = ${ first };`, `type C1 = ${ second };`];
  for (let i = 0; i < size; i++) lines.push(conditional
    ? `type C${ i + 1 }<T> = T extends string ? C${ i }<T> : C${ i }<T>;`
    : `type C${ i + 2 } = C${ i + 1 } ${ shape === 'intersection' || shape === 'closed' ? '&' : '|' } C${ i };`);
  let annotation = conditional ? `C${ size }<U>` : `C${ size + 1 }`;
  if (shape.includes('awaited')) annotation = `Awaited<${ annotation }>`;
  if (shape === 'indexed') annotation += "['list']";
  else if (shape === 'closed') annotation = `Partial<${ annotation }>`;
  const suffix = shape.endsWith('member') || shape === 'union' || shape === 'intersection' ? '.list' : '';
  if (shape === 'conditional-awaited') lines.push('// @ts-expect-error generic Awaited remains deferred until instantiation');
  lines.push(shape === 'element' ? `export function f(x: ${ annotation }) { for (const e of x) e.at(0); }`
    : `export function f<U>(x: ${ annotation }) { ${ shape === 'closed' ? '\n// @ts-expect-error the closed object has no at member\n' : '' }return x${ suffix }.at(0); }`);
  let actual = annotation.replaceAll('<U>', '<unknown>');
  if (shape === 'element') actual += '[number]';
  else if (suffix) actual += "['list']";
  const expected = shape === 'closed' ? '{ a?: 1; b?: 1 }' : 'number[]';
  lines.push(`declare const observed: ${ actual }; const expected: ${ expected } = observed;`,
    `declare const returned: ${ expected }; const same: ${ actual } = returned;`);
  return lines.join('\n');
}
// Exact depth and guard contexts allow polynomial revisits, never exponential branch expansion.
const measured = new Map();
for (const parser of adapters) for (const shape of [
  'conditional', 'conditional-member', 'conditional-awaited', 'union', 'intersection', 'element', 'closed', 'indexed', 'awaited-member',
]) {
  for (const size of [6, 12]) {
    const tree = parser.parseAndScope(typeDagSource(shape, size));
    const path = parser.pickPath(tree, 'MemberExpression', p => p.node.property?.name === 'at');
    let reads = 0;
    const kind = shape.startsWith('conditional') ? 'TSConditionalType' : shape === 'intersection' || shape === 'closed' ? 'TSIntersectionType' : 'TSUnionType';
    const key = kind === 'TSConditionalType' ? 'trueType' : 'types';
    for (const { node } of parser.collectPaths(tree, kind)) {
      const value = node[key];
      Object.defineProperty(node, key, { enumerable: true, configurable: true, get() {
        reads++;
        return value;
      } });
    }
    const answer = parser.makeResolver().resolveNodeType(path.get('object'));
    const label = `${ parser.name }/${ shape }/${ size }`;
    check(`${ label }/type`, answer?.constructor, shape === 'closed' ? 'Object' : 'Array');
    check(`${ label }/counter armed`, reads > 0, true);
    // An unresolved T reaches both identical conditional children. Without the memo,
    // even six levels read the true arm 195 times on both parsers.
    if (shape === 'conditional') check(`${ label }/conditional evaluations`, reads <= 4 * size, true);
    const family = `${ parser.name }/${ shape }`;
    if (size === 6) measured.set(family, reads);
    else check(`${ label }/bounded branching (${ measured.get(family) } -> ${ reads })`, reads <= 8 * measured.get(family), true);
  }
}

// Query-local state distinguishes every input, and the next question must see changed source.
let anchor = {};
const metadata = new WeakMap();
const { typeAnswer, typeGuardHas } = createTypeQueryCache(() => anchor, map => metadata.get(map));
const kind = {};
const node = { type: 'TSUnionType', types: [] };
const scope = {};
let calls = 0;
function read(options) {
  return typeAnswer(kind, node, { scope, depth: 0, ...options }, () => ++calls);
}
withCanonQuestion(() => {
  check('cold answer', read(), 1);
  check('same inputs reuse answer', read(), 1);
  check('depth remains an input', read({ depth: 64 }), 2);
  check('key remains an input', read({ key: 'other' }), 3);
  check('scope remains an input', read({ scope: {} }), 4);
  check('optional modifier remains an input', read({ modifiers: { optional: true } }), 5);
  anchor = {};
  check('lookup anchor remains an input', read(), 6);
  const value = { type: 'TSArrayType', elementType: { type: 'TSNumberKeyword' } };
  const map = new Map([['T', value]]);
  check('substitution', read({ map }), 7);
  check('equal substitution contents', read({ map: new Map(map) }), 7);
  map.set('T', { type: 'TSStringKeyword' });
  check('changed substitution', read({ map }), 8);
  metadata.set(map, new Map([['T', { type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'Opaque' } }]]));
  check('written arguments remain an input', read({ map }), 9);
  metadata.get(map).get('T').typeName.name = 'Other';
  check('different written argument', read({ map }), 10);
  const seen = new Set([value]);
  check('incoming guard', read({ seen }), 11);
  seen.clear();
  seen.add(node);
  check('equal guard size with a different member', read({ seen }), 12);
  check('guard contents restored', read({ seen: new Set([value]) }), 11);
  withReentrantQuestion(() => {
    check('reentry bypasses the answer', read(), 13);
    check('reentry does not retain an answer', read(), 14);
  }, 'lookup');
  check('reentry did not replace the outer answer', read(), 6);
});
check('next question does not retain source', read(), 15);

// A new blocker must invalidate the element result; unrelated ancestors must not rewalk a DAG.
const dependency = {};
let guardedCalls = 0;
function guarded(seen) {
  return typeAnswer(kind, node, { scope, depth: 0, seen, guarded: true }, () => {
    guardedCalls++;
    return typeGuardHas(seen, dependency) ? null : 'Array';
  });
}
withCanonQuestion(() => {
  check('unblocked element', guarded(new Set()), 'Array');
  check('unrelated ancestor preserves answer', guarded(new Set([node])), 'Array');
  check('unrelated ancestor did not recompute', guardedCalls, 1);
  check('newly blocked dependency invalidates answer', guarded(new Set([dependency])), null);
  check('guard mutation was observed', guardedCalls, 2);
  check('blocked answer did not poison an open one', guarded(new Set()), 'Array');
});

// Independent scopes and instantiations name different families in one resolver instance.
for (const parser of adapters) {
  const tree = parser.parseAndScope(`
    export {};
    type Pick<T> = T extends number ? { list: number[] } : { list: string };
    type Twice<T> = Pick<T> | Pick<T>;
    function array<U extends number>(x: Twice<U>) { return x.list.at(0); }
    function string(x: Twice<boolean>) { return x.list.at(0); }
    namespace A { type V = number[]; export function f(x: Awaited<Promise<V>>) { return x.at(0); } }
    namespace B { type V = string; export function f(x: Awaited<Promise<V>>) { return x.at(0); } }
  `);
  const paths = parser.collectPaths(tree, 'MemberExpression', path => path.node.property?.name === 'at');
  for (const order of [paths, [...paths].reverse()]) {
    const resolver = parser.makeResolver();
    const answers = withCanonQuestion(() => order.map(path => {
      const answer = resolver.resolveNodeType(path.get('object'));
      return answer?.primitive ? answer.type : answer?.constructor;
    }));
    checkDeep(`${ parser.name }/distinct contexts/${ order === paths ? 'forward' : 'reverse' }`, answers,
      order === paths ? ['Array', 'string', 'Array', 'string'] : ['string', 'Array', 'string', 'Array']);
  }
}

// A concrete unknown argument is accepted by tsc and reaches the same undecided branch fold.
for (const parser of adapters) {
  const source = typeDagSource('conditional-awaited', 12)
    .replace('// @ts-expect-error generic Awaited remains deferred until instantiation\n', '')
    .replace('export function f<U>(x: Awaited<C12<U>>)', 'export function f(x: Awaited<C12<unknown>>)');
  const tree = parser.parseAndScope(source);
  const path = parser.pickPath(tree, 'MemberExpression', p => p.node.property?.name === 'at');
  check(`${ parser.name }/concrete awaited argument`, parser.makeResolver().resolveNodeType(path.get('object'))?.constructor, 'Array');
}

// Flow's union/intersection nodes use the same memo and composite fold.
for (const shape of ['union', 'intersection', 'element']) {
  const source = typeDagSource(shape, 6).replaceAll('export function f<U>', 'export function f').replaceAll('declare const', 'declare var');
  // The type assertions above use TS-only `unknown`; these Flow shapes have none.
  const tree = babelAdapter.parseAndScope(source, 'module', ['flow']);
  const path = babelAdapter.pickPath(tree, 'MemberExpression', p => p.node.property?.name === 'at');
  check(`flow/${ shape }`, babelAdapter.makeResolver().resolveNodeType(path.get('object'))?.constructor, 'Array');
}

// Exceptions release the dependency recording frame as well as the question's answer table.
let threw = false;
try {
  typeAnswer(kind, node, { scope, depth: 0, guarded: true }, () => { throw new Error('probe'); });
} catch (error) {
  threw = error.message === 'probe';
}
check('query exception remains visible', threw, true);
check('query after exception remains usable', guarded(new Set()), 'Array');

// A repeated reference spelling shares only its name and simple arguments, not structural nodes.
withCanonQuestion(() => {
  function reference(name, arg) {
    return { type: 'TSTypeReference', typeName: { type: 'Identifier', name }, typeParameters: { params: [arg] } };
  }
  let queries = 0;
  function query(target) {
    return typeAnswer(kind, target, { scope, depth: 0 }, () => ++queries);
  }
  check('reference spelling first ask', query(reference('A', { type: 'TSStringKeyword' })), 1);
  check('fresh reference spelling shares answer', query(reference('A', { type: 'TSStringKeyword' })), 1);
  check('reference argument differs', query(reference('A', { type: 'TSNumberKeyword' })), 2);
  check('reference name differs', query(reference('B', { type: 'TSStringKeyword' })), 3);
  check('structural argument first ask', query(reference('A', { type: 'TSTypeLiteral', members: [] })), 4);
  check('fresh structural argument retains identity', query(reference('A', { type: 'TSTypeLiteral', members: [] })), 5);
  // Key construction must respect a bound even before the query's own depth guard executes.
  let deep = { get type() { throw new Error('spelling exceeded the depth budget'); } };
  for (let i = 0; i < 100; i++) deep = reference('A', deep);
  check('deep spelling remains bounded', query(deep), 6);
});

// Reusing an inner answer must relay its declaration dependencies to an enclosing element walk.
withCanonQuestion(() => {
  const outer = {};
  const blocker = {};
  let innerCalls = 0;
  function inner(seen) {
    return typeAnswer(kind, node, { scope, depth: 1, seen, guarded: true }, () => {
      innerCalls++;
      return typeGuardHas(seen, blocker) ? null : 'Array';
    });
  }
  function enclosing(seen) {
    return typeAnswer(kind, outer, { scope, depth: 0, seen, guarded: true }, () => inner(seen));
  }
  check('dependency replay primes inner', inner(new Set()), 'Array');
  check('outer consumes cached inner', enclosing(new Set()), 'Array');
  check('inner was reused', innerCalls, 1);
  check('outer rejects a new inner blocker', enclosing(new Set([blocker])), null);
  check('cycle fallback did not poison outer', enclosing(new Set()), 'Array');
});

// Equal-looking nodes are not interchangeable; flattening keeps the original connective and order.
const first = { type: 'TSArrayType', elementType: { type: 'TSNumberKeyword' } };
const second = { ...first };
const intersection = { type: 'TSIntersectionType', types: [first, second] };
check('single repeated node collapses', compositeAnnotationOf([first, first], 'TSUnionType'), first);
checkDeep('distinct nodes and connective survive', compositeAnnotationOf([
  first, { type: 'TSUnionType', types: [first, second] }, intersection,
], 'TSUnionType'), { type: 'TSUnionType', types: [first, second, intersection] });

// Wrapper modifiers apply inside every composite arm, including both conditional outcomes.
for (const parser of adapters) for (const body of ['A | A', 'A & A', 'U extends number ? A : A', 'U extends (infer E)[] ? A : A']) {
  for (const required of [false, true]) {
    const tree = parser.parseAndScope(`
      type A = { list${ required ? '?' : '' }: string[] };
      type X<U> = ${ body };
      export function f<U>(x: ${ required ? 'Required' : 'Partial' }<X<${ body.includes('infer') ? 'string[]' : 'U' }>>) {
        return (x.list ?? 'cat').includes('at');
      }
    `);
    const path = parser.pickPath(tree, 'MemberExpression', p => p.node.property?.name === 'includes');
    check(`${ parser.name }/${ required ? 'required' : 'partial' }/${ body }`,
      parser.makeResolver().resolveNodeType(path.get('object'))?.constructor ?? null, required ? 'Array' : null);
  }
}

finish();

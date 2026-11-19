// Keyed reads of a wide literal must not scan every unrelated property for each read.
// Count key reads after parsing; the budget is independent of the machine's speed.
import {
  collectFileCensus,
  findObjectKeyBeforeSpread,
  objectLevelPairedProperty,
  objectPropertiesForKey,
  patternSlotValues,
  propertyKeyName,
  unwrapRuntimeExpr,
  withTraversalCaches,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { findNamespaceMemberValue } from '../../packages/core-js-polyfill-provider/helpers/class-walk.js';
import { adapters, createChecker } from './harness.mjs';

const { check, checkDeep, checkTruthy, finish } = createChecker('object-property-complexity');

function inCensus(program, query) {
  return collectFileCensus(program.node, [{
    visit() { /* The lookup runs during finalization. */ },
    result() {
      query();
      return {};
    },
  }]);
}

for (const parser of adapters) {
  for (const phase of ['traversal', 'census']) {
    const counts = [];
    for (const size of [48, 96, 192]) {
      const source = [
        `const box = { ${ Array.from({ length: size }, (_, i) => `k${ i }: Math`).join(', ') } };`,
        ...Array.from({ length: size }, (_, i) => `const { k${ i }: X${ i } } = box;`),
      ].join('\n');
      const program = parser.parseAndScope(source);
      const declarations = parser.collectPaths(program, 'VariableDeclarator');
      const object = declarations[0].node.init;
      let reads = 0;
      for (const prop of object.properties) {
        const { key } = prop;
        Object.defineProperty(prop, 'key', {
          configurable: true, enumerable: true,
          get() { reads++; return key; },
        });
      }
      object.properties.forEach(prop => prop.key);
      check(`${ parser.name }/${ phase }/${ size }/counter control`, reads, size);
      reads = 0;
      function readAll() {
        for (let i = 0; i < size; i++) {
          const value = findNamespaceMemberValue(object, `k${ i }`, null, {}, ({ node }) => node.name);
          check(`${ parser.name }/${ phase }/${ size }/namespace ${ i }`, value?.name, 'Math');
          const paired = patternSlotValues(declarations[i + 1].node.id, object, `X${ i }`);
          checkDeep(`${ parser.name }/${ phase }/${ size }/pattern ${ i }`, paired.map(node => node.name), ['Math']);
          check(`${ parser.name }/${ phase }/${ size }/literal ${ i }`, objectLevelPairedProperty(object, `k${ i }`)?.read?.name, 'Math');
        }
      }
      if (phase === 'traversal') withTraversalCaches(true, readAll);
      else inCensus(program, readAll);
      checkTruthy(`${ parser.name }/${ phase }/${ size }/non-vacuous work`, reads >= size);
      checkTruthy(`${ parser.name }/${ phase }/${ size }/linear key budget`, reads <= 10 * size, String(reads));
      counts.push(reads);
    }
    for (let at = 1; at < counts.length; at++) {
      checkTruthy(`${ parser.name }/${ phase }/doubling ${ at }`, counts[at] <= 2.5 * counts[at - 1], counts.join(' -> '));
    }
  }

  for (const [body, narrow] of [
    ['a: Array, b: Math, a: Map', true],
    ['get a() { return Array; }, b: Math, set a(value) {}', true],
    ['"a": Array, b: Math', true],
    ['a: Array, ...other', false],
    ['...other, a: Array', false],
    ['a: Array, [key]: Map', false],
    ['[key]: Map, a: Array', false],
    ['a: Array, ["b"]: Math', false],
    ['a: Array, 0: Map', false],
  ]) {
    const program = parser.parseAndScope(`const box = { ${ body } };`);
    const object = unwrapRuntimeExpr(parser.pickPath(program, 'VariableDeclarator').node.init);
    const { properties } = object;
    function matches(prop) { return propertyKeyName(prop) === 'a'; }
    const own = objectLevelPairedProperty(object, 'a');
    const later = objectLevelPairedProperty(object, 'a', () => null);
    const expected = findObjectKeyBeforeSpread(properties, matches);
    function resolveKey({ node, computed }) { return computed ? node.value ?? null : node.name ?? node.value ?? null; }
    const namespace = [true, false].map(spreadVetoes => findNamespaceMemberValue(object, 'a', null, {}, resolveKey, { spreadVetoes }));
    withTraversalCaches(true, () => {
      check(`${ parser.name }/${ body }/single query stays unindexed`, objectPropertiesForKey(properties, 'a'), properties);
      const candidates = objectPropertiesForKey(properties, 'a');
      check(`${ parser.name }/${ body }/literal read`, objectLevelPairedProperty(object, 'a')?.read, own?.read);
      check(`${ parser.name }/${ body }/custom later veto`, objectLevelPairedProperty(object, 'a', () => null)?.read, later?.read);
      check(`${ parser.name }/${ body }/index eligibility`, candidates !== properties, narrow);
      check(`${ parser.name }/${ body }/same winning property`, findObjectKeyBeforeSpread(properties, matches, 'a'), expected);
      for (const [i, spreadVetoes] of [true, false].entries()) {
        check(`${ parser.name }/${ body }/namespace ${ spreadVetoes }`,
          findNamespaceMemberValue(object, 'a', null, {}, resolveKey, { spreadVetoes }), namespace[i]);
      }
      function getter(prop) { return matches(prop) && prop.kind === 'get'; }
      check(`${ parser.name }/${ body }/matcher can reject last duplicate`,
        findObjectKeyBeforeSpread(properties, getter, 'a'), findObjectKeyBeforeSpread(properties, getter));
    });
  }

  const program = parser.parseAndScope('const box = { a: Array, x: Math }; const other = { a: Map, x: Math };');
  const [object, other] = parser.collectPaths(program, 'ObjectExpression').map(path => path.node);
  function query(target) {
    return findObjectKeyBeforeSpread(target.properties, prop => propertyKeyName(prop) === 'a', 'a')?.value?.name ?? null;
  }
  withTraversalCaches(true, () => {
    check(`${ parser.name }/initial read-only query`, query(object), 'Array');
    check(`${ parser.name }/repeated read-only query`, query(object), 'Array');
    const candidates = objectPropertiesForKey(object.properties, 'a');
    try {
      withTraversalCaches(true, () => {
        check(`${ parser.name }/nested object`, query(other), 'Map');
        throw new Error('nested walk');
      });
    } catch (error) {
      check(`${ parser.name }/nested failure`, error.message, 'nested walk');
    }
    check(`${ parser.name }/outer restored`, query(object), 'Array');
    check(`${ parser.name }/outer index restored`, objectPropertiesForKey(object.properties, 'a'), candidates);
    withTraversalCaches(false, () => {
      check(`${ parser.name }/rewriting walk is live`, query(other), 'Map');
      check(`${ parser.name }/repeated rewriting query`, query(other), 'Map');
      other.properties[0].key.name = 'b';
      check(`${ parser.name }/rewriting key edit`, query(other), null);
      other.properties[1].key.name = 'a';
      check(`${ parser.name }/rewriting new key`, query(other), 'Math');
    });
  });
  inCensus(program, () => {
    check(`${ parser.name }/census query`, query(object), 'Array');
    check(`${ parser.name }/repeated census query`, query(object), 'Array');
  });
  try {
    inCensus(program, () => {
      query(object);
      query(object);
      throw new Error('census result');
    });
  } catch (error) {
    check(`${ parser.name }/census failure`, error.message, 'census result');
  }
  object.properties[0].key.name = 'b';
  check(`${ parser.name }/uncached key edit`, query(object), null);
  object.properties[1].key.name = 'a';
  check(`${ parser.name }/uncached new key`, query(object), 'Math');
  withTraversalCaches(true, () => check(`${ parser.name }/later walk rebuilds`, query(object), 'Math'));
  check(`${ parser.name }/unknown key keeps original list`,
    withTraversalCaches(true, () => objectPropertiesForKey(object.properties, null)), object.properties);
}

finish();

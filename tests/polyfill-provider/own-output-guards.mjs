// Prior guards and mapped steps own only the values their imported helpers already serve.
import { ownEmittedNavClaim, ownEmittedPatternClaim, ownOutputTests } from '../../packages/core-js-polyfill-provider/detect-usage/own-output.js';
import { claimAlreadyRendered } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { pureImportEntryOf, withCanonQuestion } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { adapters, createChecker } from './harness.mjs';

const { check, finish } = createChecker('own-output-guards');
const tests = ownOutputTests({ pkg: '@core-js/pure', isOwnPassPureBinding: () => false });
const ofImport = 'import ofArray from "@core-js/pure/actual/array/of";';
const mapperSource = `import map from '@core-js/pure/actual/iterator/map';
import iterator from '@core-js/pure/actual/get-iterator';
import at from '@core-js/pure/actual/instance/at';
const mapped = map(iterator(rows), (value, index) => index === 0 ? { at: at(value) } : value);
const step = mapped.next();
const { at: method } = step.done ? void 0 : step.value;`;
for (const parser of adapters) {
  for (const [name, source, expected] of [
    ['recursive selection', `${ ofImport } const { Array: { of } } = flag ? null == w ? w : { Array: { of: ofArray } } : { Array: { of: ofArray } };`, true],
    ['logical selection', `${ ofImport } const { Array: { of } } = x || (y ?? { Array: { of: ofArray } });`, true],
    ['foreign slot', 'const ofArray = source; const { Array: { of } } = flag ? null == w ? w : { Array: { of: ofArray } } : other;', false],
    ['shadowed slot', `${ ofImport } function f(ofArray) { const { Array: { of } } = flag ? { Array: { of: ofArray } } : other; }`, false],
    ['native payload below guard', 'import root from "@core-js/pure/actual/global-this"; const { at } = (null == root.window ? void 0 : root).items;', false],
    ['iterator method', 'import method from "@core-js/pure/actual/get-iterator-method"; const { name } = method(rows);', true],
    ['foreign iterator method', 'import method from "foreign/get-iterator-method"; const { name } = method(rows);', false],
    ['shadowed iterator method', 'import method from "@core-js/pure/actual/get-iterator-method"; function f(method) { const { name } = method(rows); }', false],
    ['different helper', 'import method from "@core-js/pure/actual/get-iterator"; const { name } = method(rows);', false],
    ['mapped step', mapperSource, true],
    ['wrong mapped index', mapperSource.replace('index === 0', 'index === 1'), false],
    ['wrong step object', mapperSource.replace(': step.value', ': other.value'), false],
    ['extra iterator step', mapperSource.replace('const step =', 'mapped.next(); const step ='), false],
    ['earlier declarator write', mapperSource.replace('const { at: method }', 'const changed = step.value = other, { at: method }'), false],
    ['changed iterator next', mapperSource.replace('const step =', 'mapped.next = foreign; const step ='), false],
    ['foreign mapper', mapperSource.replace('@core-js/pure/actual/iterator/map', 'foreign/map'), false],
    ['foreign iterator', mapperSource.replace('@core-js/pure/actual/get-iterator', 'foreign/iterator'), false],
    ['foreign dispatcher', mapperSource.replace('@core-js/pure/actual/instance/at', 'foreign/at'), false],
    ['unserved mapped slot', mapperSource.replace('{ at: at(value) }', '{ other: at(value) }'), false],
    ['shadowed mapper helper', mapperSource.replace('value, index', 'at, index').replace('at(value)', 'at(at)').replace(': value)', ': at)'), false],
    ['non-declaration predecessor', mapperSource.replace('const mapped = map', 'use(map').replace(': value);', ': value));'), false],
  ]) {
    const tree = parser.parseAndScope(source);
    const path = parser.pickPath(tree, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
      item => item.parentPath.node.type === 'ObjectPattern' && item.node.value.type === 'Identifier');
    check(`${ parser.name }/${ name }`, withCanonQuestion(() => ownEmittedPatternClaim(path, tests)), expected);
  }
  for (const flavor of ['actual', 'stable', 'es', 'features']) for (const cjs of [false, true]) {
    const source = `@core-js/pure/${ flavor }/get-iterator-method`;
    const imported = cjs ? `const method = require('${ source }');` : `import method from '${ source }';`;
    const tree = parser.parseAndScope(`${ imported } const { name } = method(rows);`);
    const path = parser.pickPath(tree, parser.name === 'babel' ? 'ObjectProperty' : 'Property');
    check(`${ parser.name }/iterator flavor ${ flavor }/cjs ${ cjs }`, ownEmittedPatternClaim(path, tests), true);
  }
  for (const source of [
    'import method from "@core-js/pure/actual/get-iterator-method"; const { name } = method(rows);',
    mapperSource,
  ]) {
    const tree = parser.parseAndScope(source);
    const path = parser.pickPath(tree, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
      item => item.parentPath.node.type === 'ObjectPattern');
    check(`${ parser.name }/current-pass helper stays live`, ownEmittedPatternClaim(path, {
      ...tests, isOwnPassBinding: () => true,
    }), false);
  }
  for (const [name, expression, expected] of [
    ['adjacent tail', '(w.self, self)', true],
    ['adjacent prefix', '(w.self, self, 1)', true],
    ['nested tail', '((effect(), w.self), self, 1)', true],
    ['typed tail', '(((effect(), w.self) as unknown)!, self, 1)', true],
    ['intervening effect', '(w.self, effect(), self)', false],
    ['consumed read', '(consume(w.self), self)', false],
    ['stored read', '(saved = w.self, self)', false],
    ['selected read', '(flag ? w.self : other, self)', false],
    ['other value', '(w.self, other, self)', false],
  ]) {
    const tree = parser.parseAndScope(`import self from '@core-js/pure/actual/self'; ${ expression };`);
    const path = parser.pickPath(tree, 'MemberExpression', item => item.node.property.name === 'self');
    const adapter = { getBinding: ({ path: at, name: key }) => ({ polyfillHint: pureImportEntryOf(at, key) }) };
    check(`${ parser.name }/probe/${ name }`, claimAlreadyRendered(path.node, { path, scope: path.scope, adapter }), expected);
  }
  const tree = parser.parseAndScope(`import root from '@core-js/pure/actual/global-this';
    import self from '@core-js/pure/actual/self'; const { custom } = (null == root.window ? void 0 : self).Map;`);
  const path = parser.pickPath(tree, 'MemberExpression', item => item.node.property.name === 'Map');
  check(`${ parser.name }/native receiver under pattern`, ownEmittedNavClaim(path.node, path, tests, null, { placement: 'prototype' }), true);
}
finish();

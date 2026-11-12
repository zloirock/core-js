// Prior-output recognition requires a scoped capture and its matching extraction.
// Parser-generated names, unrelated imports and parameter-body shadows prove nothing.
import { ownEmittedNavClaim, ownEmittedPatternClaim, ownOutputTests, sentinelAlreadyProcessed } from '../../packages/core-js-polyfill-provider/detect-usage/own-output.js';
import { withCanonQuestion } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { adapters, createChecker } from './harness.mjs';

const { check, finish } = createChecker('own-output-captures');
const pkg = '@core-js/pure';
const importFrom = `import fromArray from '${ pkg }/actual/array/from';`;
const importName = `import readName from '${ pkg }/actual/function/instance/name';`;
const tests = ownOutputTests({ pkg, isOwnPassPureBinding: () => false });

for (const parser of adapters) for (const [label, source, expected] of [
  ['foreign memo', 'var _ref; _ref = source; _ref.at;', false],
  ['unrelated import', `${ importFrom } var _ref; _ref = source; _ref.at;`, false],
  ['unrelated call in the capture', `${ importFrom } var _ref; (_ref = source, fromArray(other), _ref.at);`, false],
  ['same name in another function', `${ importName } var _ref; (_ref = source, readName(_ref)); function f(_ref) { return _ref.at; }`, false],
  ['parameter before body var', `${ importName } function f(value = _ref.at) { var _ref; (_ref = source, readName(_ref)); }`, false],
  ['later foreign write', `${ importName } var _ref; (_ref = source, readName(_ref)); _ref = other; _ref.at;`, false],
  ['bundled dispatch', 'function f() { var _ref; _at(_ref = source).call(_ref, 0); return _ref.at; }', true],
  ['shadowed dispatch helper', `import _at from '${ pkg }/actual/instance/at'; function f(_at) { var _ref; _at(_ref = source).call(_ref, 0); return _ref.at; }`, false],
  ['foreign call receiver', 'function f() { var _ref; _at(_ref = source).call(other, 0); return _ref.at; }', false],
  ['required entry', `const readName = require('${ pkg }/actual/function/instance/name'); function f() { var _ref; return (_ref = source, readName(_ref), _ref.at); }`, true],
  ['rewritten required entry', `let readName = require('${ pkg }/actual/function/instance/name'); readName = foreign; var _ref; (_ref = source, readName(_ref), _ref.at);`, false],
  ['array capture', `${ importName } var _ref; [, _ref] = [source, other]; name = readName(source); _ref.at;`, true],
  ['foreign array capture', 'var _ref; [, _ref] = [source, other]; _ref.at;', false],
  ['array capture unrelated receiver', `${ importName } var _ref; [, _ref] = [source, other]; name = readName(unrelated); _ref.at;`, false],
  ['array capture unrelated binding', `${ importName } function f(readName) { var _ref; [, _ref] = [source, other]; name = readName(source); _ref.at; }`, false],
  ['owned capture', `${ importName } var _ref; (_ref = source, readName(_ref), _ref.at);`, true],
  ['owned local capture', `${ importName } function f() { var _ref; return (_ref = source, readName(_ref), _ref.at); }`, true],
  ['bodyless var capture', `${ importName } function f() { if (flag) var _ref; return (_ref = source, readName(_ref), _ref.at); }`, true],
  ['shadowed import', `${ importName } function f(readName) { var _ref; return (_ref = source, readName(_ref), _ref.at); }`, false],
  ['initialized source binding', `${ importName } var _ref = source; (readName(_ref), _ref.at);`, false],
]) {
  const tree = parser.parseAndScope(source);
  const path = parser.pickPath(tree, 'MemberExpression', item => item.node.property.name === 'at');
  check(`${ parser.name }/${ label }`, ownEmittedNavClaim(path.node, path, tests), expected);
  if (expected) check(`${ parser.name }/${ label }/current pass`, ownEmittedNavClaim(path.node, path, {
    ...tests, isOwnPassName: name => name === '_ref',
  }), false);
}

for (const parser of adapters) for (const [label, source, expected] of [
  ['aliased entry', `${ importFrom } function f([{ from, [(effect(), 'key')]: value } = Array]) { from = fromArray; return from; }`, true],
  ['renamed binding', `${ importFrom } function f([{ from: local, [(effect(), 'key')]: value } = Array]) { local = fromArray; return local; }`, true],
  ['wrong entry', `import fromArray from '${ pkg }/actual/array/of'; function f([{ from, [(effect(), 'key')]: value } = Array]) { from = fromArray; return from; }`, false],
  ['body shadow', `${ importFrom } function f([{ from, [(effect(), 'key')]: value } = Array]) { from = fromArray; var fromArray = foreign; return from; }`, false],
  ['intervening rebind', `${ importFrom } import ofArray from '${ pkg }/actual/array/of'; function f([{ of, from, [(effect(), 'key')]: value } = Array]) { of = ofArray; from = fromArray; return from; }`, true],
  ['intervening effect', `${ importFrom } function f([{ from, [(effect(), 'key')]: value } = Array]) { effect(); from = fromArray; return from; }`, false],
  ['assignment sibling', `${ importFrom } let from; ({ from, [(effect(), 'key')]: value } = Array); from = fromArray;`, true],
]) {
  const tree = parser.parseAndScope(source);
  const path = parser.pickPath(tree, parser.name === 'babel' ? 'ObjectProperty' : 'Property', item => item.node.key.name === 'from');
  check(`${ parser.name }/overwrite/${ label }`, ownEmittedPatternClaim(path, tests), expected);
}

const hosts = [
  expression => `if (${ expression }) {}`,
  expression => `while (${ expression }) { break; }`,
  expression => `do {} while (${ expression });`,
  expression => `for (; ${ expression };) { break; }`,
  expression => `for (let i = 0; i < 1; ${ expression }) { break; }`,
  expression => `switch (${ expression }) {}`,
  expression => `use(${ expression });`,
  expression => `new Use(${ expression });`,
  expression => `flag && (${ expression });`,
  expression => `const list = [${ expression }];`,
  expression => `const box = { value: (${ expression }) };`,
  expression => `export default (${ expression });`,
];
for (const parser of adapters) for (const [index, host] of hosts.entries()) for (const matching of [false, true]) {
  const tree = parser.parseAndScope(`${ importFrom } let from, rest; var _unused;
    ${ host(`(from = ${ matching ? 'fromArray' : 'foreign' }, { from: _unused, ...rest } = Array, Array)`) }`);
  const path = parser.pickPath(tree, parser.name === 'babel' ? 'ObjectProperty' : 'Property', item => item.node.key.name === 'from');
  const injector = { packages: [pkg], hasGeneratedUnusedName: () => true, isAdoptedUnusedName: () => true, getPureImport: () => null };
  check(`${ parser.name }/expression host ${ index }/matching ${ matching }`, sentinelAlreadyProcessed(path, {
    node: path.node, meta: { key: 'from' }, injector,
  }), matching);
}
// A large residual shares one capture proof during a read-only census, then expires it.
for (const parser of adapters) {
  const count = 160;
  const tree = parser.parseAndScope(`${ importName } var _ref;
    (_ref = source, readName(_ref), ${ Array(count).fill('_ref.at').join(', ') });`);
  const paths = parser.collectPaths(tree, 'MemberExpression');
  const sequence = parser.pickPath(tree, 'SequenceExpression').node;
  const { expressions } = sequence;
  let visits = 0;
  sequence.expressions = new Proxy(expressions, {
    get(target, key, receiver) {
      if (typeof key === 'string' && /^\d+$/u.test(key)) visits++;
      return Reflect.get(target, key, receiver);
    },
  });
  try {
    const claims = withCanonQuestion(() => paths.filter(item => ownEmittedNavClaim(item.node, item, tests)));
    check(`${ parser.name }/large residual/claims`, claims.length, count);
    check(`${ parser.name }/large residual/linear visits`, visits > 0 && visits < count * 4, true);
    const imported = parser.pickPath(tree, 'ImportDeclaration').node;
    imported.source.value = 'foreign-package';
    check(`${ parser.name }/large residual/expired provenance`,
      withCanonQuestion(() => ownEmittedNavClaim(paths[0].node, paths[0], tests)), false);
  } finally {
    sequence.expressions = expressions;
  }
}
finish();

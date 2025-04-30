/* eslint-disable import/no-dynamic-require, node/global-require -- required */
import { ok } from 'node:assert/strict';

const PATH = 'core-js';
const NS = 'full';

function load(...components) {
  const path = [PATH, ...components].join('/');
  return require(path);
}

// $justImport
load(NS, 'array-buffer/detached');
// $virtual
ok(load(NS, 'array/virtual/at').call([1, 2, 3], -2) === 2);
// $virtualIterator
ok('next' in load(NS, 'array/virtual/iterator').call([]));
// $prototype
ok(load(NS, 'array/at')([1, 2, 3], -2) === 2);
// $prototypeIterator
ok('next' in load(NS, 'array/iterator')([]));
// $static
ok(Array.isArray(load(NS, 'array/from')('qwe')));
// $staticWithContext
ok(load(NS, 'promise/all-settled')([1, 2, 3]) instanceof Promise);
// $patchableStatic
ok(load(NS, 'json/stringify')([1]) === '[1]');
// $namespace
ok(typeof load(NS, 'async-disposable-stack/constructor') == 'function');
// $helper
ok('next' in load(NS, 'get-iterator')([]));
// $path
ok(new (load(NS, 'error/constructor').Error)(1, { cause: 7 }).cause === 7);
// $instanceArray
const instanceConcat = load(NS, 'instance/concat');
ok(typeof instanceConcat == 'function');
ok(instanceConcat({}) === undefined);
ok(typeof instanceConcat([]) == 'function');
ok(instanceConcat([]).call([1, 2, 3], [4, 5, 6]).length === 6);
// $instanceString
const instanceCodePointAt = load(NS, 'instance/code-point-at');
ok(typeof instanceCodePointAt == 'function');
ok(instanceCodePointAt({}) === undefined);
ok(typeof instanceCodePointAt('') == 'function');
ok(instanceCodePointAt('').call('a', 0) === 97);
// $instanceFunction
const instanceDemethodize = load(NS, 'instance/demethodize');
ok(typeof instanceDemethodize == 'function');
ok(instanceDemethodize({}) === undefined);
ok(typeof instanceDemethodize([].slice) == 'function');
ok(instanceDemethodize([].slice).call([].slice)([1, 2, 3], 1)[0] === 2);
// $instanceDOMIterables
const instanceForEach = load(NS, 'instance/for-each');
ok(typeof instanceForEach == 'function');
ok(instanceForEach({}) === undefined);
ok(typeof instanceForEach([]) == 'function');
// $instanceArrayString
const instanceAt = load(NS, 'instance/at');
ok(typeof instanceAt == 'function');
ok(instanceAt({}) === undefined);
ok(typeof instanceAt([]) == 'function');
ok(typeof instanceAt('') == 'function');
ok(instanceAt([]).call([1, 2, 3], 2) === 3);
ok(instanceAt('').call('123', 2) === '3');
// $instanceArrayDOMIterables
const instanceEntries = load(NS, 'instance/entries');
ok(typeof instanceEntries == 'function');
ok(instanceEntries({}) === undefined);
ok(typeof instanceEntries([]) == 'function');
ok(instanceEntries([]).call([1, 2, 3]).next().value[1] === 1);
// $instanceRegExpFlags
const instanceFlags = load(NS, 'instance/flags');
ok(typeof instanceFlags == 'function');
ok(instanceFlags({}) === undefined);
ok(instanceFlags(/./g) === 'g');
// $proposal
load('proposals/accessible-object-hasownproperty');

echo(chalk.green('templates entry points tested'));

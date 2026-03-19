/* eslint-disable prefer-regex-literals -- required for testing */
import { DESCRIPTORS } from '../helpers/constants.js';

if (DESCRIPTORS) {
  QUnit.test('RegExp#hasIndices', assert => {
    const re = RegExp('a', 'd');
    assert.true(re.hasIndices, '.hasIndices is true');
    assert.same(re.flags, 'd', '.flags contains d');
    assert.false(RegExp('a').hasIndices, 'no');
    assert.false(/a/.hasIndices, 'no in literal');

    const hasIndicesGetter = Object.getOwnPropertyDescriptor(RegExp.prototype, 'hasIndices').get;
    if (typeof hasIndicesGetter == 'function') {
      assert.throws(() => {
        hasIndicesGetter.call({});
      }, undefined, '.hasIndices getter can only be called on RegExp instances');
      try {
        hasIndicesGetter.call(/a/);
        assert.required('.hasIndices getter works on literals');
      } catch {
        assert.avoid('.hasIndices getter works on literals');
      }
      try {
        hasIndicesGetter.call(new RegExp('a'));
        assert.required('.hasIndices getter works on instances');
      } catch {
        assert.avoid('.hasIndices getter works on instances');
      }

      assert.true(Object.hasOwn(RegExp.prototype, 'hasIndices'), 'prototype has .hasIndices property');
    }
  });

  QUnit.test('RegExp Match Indices - basic', assert => {
    const re = RegExp('a', 'd');
    const result = re.exec('ba');
    assert.notSame(result, null, 'exec returns result');
    assert.true(!!result.indices, 'result has indices');
    assert.deepEqual(result.indices[0], [1, 2], 'full match indices');
  });

  QUnit.test('RegExp Match Indices - capture groups', assert => {
    const re = RegExp('(a)(b)', 'd');
    const result = re.exec('ab');
    assert.true(!!result.indices, 'result has indices');
    assert.deepEqual(result.indices[0], [0, 2], 'full match');
    assert.deepEqual(result.indices[1], [0, 1], 'group 1');
    assert.deepEqual(result.indices[2], [1, 2], 'group 2');
  });

  QUnit.test('RegExp Match Indices - non-participating groups', assert => {
    const re = RegExp('(a)|(b)', 'd');
    const result = re.exec('b');
    assert.true(!!result.indices, 'result has indices');
    assert.deepEqual(result.indices[0], [0, 1], 'full match');
    assert.same(result.indices[1], undefined, 'non-participating group is undefined');
    assert.deepEqual(result.indices[2], [0, 1], 'participating group');
  });

  QUnit.test('RegExp Match Indices - named groups', assert => {
    const re = RegExp('(?<first>a)(?<second>b)', 'd');
    const result = re.exec('ab');
    assert.true(!!result.indices, 'result has indices');
    assert.true(!!result.indices.groups, 'indices has groups');
    assert.deepEqual(result.indices.groups.first, [0, 1], 'named group first');
    assert.deepEqual(result.indices.groups.second, [1, 2], 'named group second');
  });

  QUnit.test('RegExp Match Indices - nested groups', assert => {
    const re = RegExp('(a(b))', 'd');
    const result = re.exec('ab');
    assert.true(!!result.indices, 'result has indices');
    assert.deepEqual(result.indices[0], [0, 2], 'full match');
    assert.deepEqual(result.indices[1], [0, 2], 'outer group');
    assert.deepEqual(result.indices[2], [1, 2], 'inner group');
  });

  QUnit.test('RegExp Match Indices - offset match', assert => {
    const re = RegExp('(b)(c)', 'd');
    const result = re.exec('abc');
    assert.true(!!result.indices, 'result has indices');
    assert.deepEqual(result.indices[0], [1, 3], 'full match');
    assert.deepEqual(result.indices[1], [1, 2], 'group 1');
    assert.deepEqual(result.indices[2], [2, 3], 'group 2');
  });

  QUnit.test('RegExp Match Indices - with dotAll flag', assert => {
    const re = RegExp('(.)(.)', 'ds');
    const result = re.exec('\na');
    assert.true(!!result.indices, 'result has indices');
    assert.deepEqual(result.indices[0], [0, 2], 'full match');
    assert.deepEqual(result.indices[1], [0, 1], 'group 1');
    assert.deepEqual(result.indices[2], [1, 2], 'group 2');
  });

  QUnit.test('RegExp Match Indices - with global flag', assert => {
    const re = RegExp('(a)', 'dg');
    const result1 = re.exec('aa');
    assert.true(!!result1.indices, 'first result has indices');
    assert.deepEqual(result1.indices[0], [0, 1], 'first match');
    assert.deepEqual(result1.indices[1], [0, 1], 'first match group');
    const result2 = re.exec('aa');
    assert.true(!!result2.indices, 'second result has indices');
    assert.deepEqual(result2.indices[0], [1, 2], 'second match');
    assert.deepEqual(result2.indices[1], [1, 2], 'second match group');
  });

  QUnit.test('RegExp Match Indices - no match returns null', assert => {
    const re = RegExp('z', 'd');
    const result = re.exec('abc');
    assert.same(result, null, 'no match returns null');
  });
}

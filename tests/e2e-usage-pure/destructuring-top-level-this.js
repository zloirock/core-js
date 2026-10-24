import {
  readArray,
  readString,
  readDefault,
  readPrefixed,
  readPrefixedDeclaration,
  readLoop,
  readUserArray,
  readUserString,
  readCapturedUser,
  readPrefixedUser,
  readUserLoop,
  userReads,
} from './destructuring-top-level-this-host.cjs';
import { withTemporaryProperty } from '../helpers/restore-property.cjs';

QUnit.test('destructuring: top-level this prototype assignment retains a sibling', assert => {
  withTemporaryProperty(Array.prototype, 'at', undefined, () => {
    const array = readArray();
    assert.same(array.at.call([1, 2], -1), 2);
    assert.same(array.sibling, 'kept');
  });
  withTemporaryProperty(String.prototype, 'at', undefined, () => {
    const string = readString();
    assert.same(string.at.call('xy', -1), 'y');
    assert.same(string.sibling, 'kept');
  });
});

QUnit.test('destructuring: top-level this prototype ponyfill precedes the leaf default', assert => {
  withTemporaryProperty(Array.prototype, 'at', undefined, () => {
    let defaults = 0;
    const result = readDefault(() => {
      defaults++;
      return 'fallback';
    });
    assert.same(typeof result.at, 'function');
    assert.same(result.at.call([3, 4], -1), 4);
    assert.same(result.sibling, 'kept');
    assert.same(defaults, 0);
  });
});

QUnit.test('destructuring: top-level this retains the prefix and the loop element', assert => {
  withTemporaryProperty(Array.prototype, 'at', undefined, () => {
    let prefixes = 0;
    const result = readPrefixed(() => { prefixes++; });
    assert.same(result.at.call([3, 4], -1), 4);
    assert.same(result.sibling, 'kept');
    assert.same(prefixes, 1);
    const at = readPrefixedDeclaration(() => { prefixes++; });
    assert.same(at.call([5, 6], -1), 6);
    assert.same(prefixes, 2);
  });
  withTemporaryProperty(String.prototype, 'at', undefined, () => {
    assert.same(readLoop().call('xy', -1), 'y');
  });
});

QUnit.test('destructuring: user slots on top-level this dispatch once on their runtime values', assert => {
  withTemporaryProperty(Array.prototype, 'at', undefined, () => {
    const before = userReads();
    const result = readUserArray();
    assert.same(result.at.call([3, 4], -1), 4);
    assert.same(result.sibling, 'kept');
    assert.same(userReads() - before, 1);
    assert.same(readCapturedUser().call([5, 6], -1), 6);
    assert.same(userReads() - before, 2);
    let prefixes = 0;
    assert.same(readPrefixedUser(() => { prefixes++; }).call([7, 8], -1), 8);
    assert.same(prefixes, 1);
    assert.same(userReads() - before, 3);
    assert.same(readUserLoop().call([9, 10], -1), 10);
    assert.same(userReads() - before, 4);
  });
  withTemporaryProperty(String.prototype, 'at', undefined, () => {
    assert.same(readUserString().call('xy', -1), 'y');
  });
});

QUnit.test('destructuring: a user global can hold an instance, an own method or a missing method', assert => {
  for (const [prototype, value, expected] of [[Array.prototype, [1, 2], 2], [String.prototype, 'xy', 'y']]) {
    withTemporaryProperty(prototype, 'at', undefined, () => {
      withTemporaryProperty(globalThis, 'Data', value, () => {
        const { Data: { at } } = globalThis;
        assert.same(at.call(value, -1), expected);
        let method;
        // eslint-disable-next-line prefer-const -- Exercise the destructuring assignment host.
        ({ Data: { at: method } } = globalThis);
        assert.same(method.call(value, -1), expected);
        // eslint-disable-next-line no-unsafe-optional-chaining -- The realm cannot short-circuit; test its optional spelling.
        const { Data: { at: optional } } = globalThis?.globalThis;
        assert.same(optional.call(value, -1), expected);
        const [{ Data: { at: wrapped } = [3, 4] }] = [globalThis?.globalThis];
        assert.same(wrapped.call(value, -1), expected);
        const { Data: { at: selected } } = globalThis || {};
        assert.same(selected.call(value, -1), expected);
        let prefixes = 0;
        const { Data: { at: prefixed } } = (prefixes++, globalThis) ?? {};
        assert.same(prefixed.call(value, -1), expected);
        assert.same(prefixes, 1);
        const { Data: { at: innerPrefix } } = (prefixes++, globalThis ?? {});
        assert.same(innerPrefix.call(value, -1), expected);
        assert.same(prefixes, 2);
      });
    });
  }
  let reads = 0;
  const own = { get at() {
    reads++;
    return () => 7;
  } };
  withTemporaryProperty(globalThis, 'Data', own, () => {
    const { Data: { at } } = globalThis;
    assert.same(at(), 7);
    assert.same(reads, 1);
  });
  withTemporaryProperty(globalThis, 'Data', {}, () => {
    let defaults = 0;
    const { Data: { at = (defaults++, 9) } } = globalThis;
    assert.same(at, 9);
    assert.same(defaults, 1);
  });
  withTemporaryProperty(Array.prototype, 'at', undefined, () => {
    withTemporaryProperty(globalThis, 'Data', undefined, () => {
      let defaults = 0;
      const [{ Data: { at } = (defaults++, [3, 4]) }] = [globalThis?.globalThis];
      assert.same(at.call([3, 4], -1), 4);
      assert.same(defaults, 1);
      // eslint-disable-next-line no-unsafe-optional-chaining -- The realm cannot short-circuit; test its optional spelling.
      const { Data: { at: direct } = (defaults++, [5, 6]) } = globalThis?.globalThis;
      assert.same(direct.call([5, 6], -1), 6);
      assert.same(defaults, 2);
    });
  });
});

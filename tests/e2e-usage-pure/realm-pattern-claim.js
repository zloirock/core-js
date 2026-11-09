import { withWindowPresence } from './unbacked-window-host.cjs';
import { withTemporaryProperty } from '../helpers/restore-property.cjs';

QUnit.test('a nested realm pattern anchors its own alias and loop receiver', assert => {
  const realm = globalThis;
  const { globalThis: { Array: { prototype: { at, includes } } } } = realm;
  assert.same(at.call([3, 4], -1), 4);
  assert.true(includes.call([3], 3));
  for (const current of [globalThis]) {
    const { globalThis: { Array: { prototype: { at: last, includes: contains } } } } = current;
    assert.same(last.call([5, 6], -1), 6);
    assert.true(contains.call([5], 5));
  }
});

QUnit.test('a declined sealed realm route leaves its root attached', assert => {
  withWindowPresence(true, () => withTemporaryProperty(globalThis, 'e2eRealmMarker', 23, () => {
    // eslint-disable-next-line no-unsafe-optional-chaining -- the realm root is defined; the grouping is the subject
    assert.same((globalThis?.window).e2eRealmMarker, 23);
  }));
});

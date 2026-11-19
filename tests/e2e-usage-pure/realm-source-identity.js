import { withTemporaryProperty } from '../helpers/restore-property.cjs';

QUnit.test('realm source: a local self keeps its nested and flat receivers', assert => {
  const owner = {
    state: { form: ['a', 'b'] },
    list: [3, 7],
    read() {
      const self = this;
      const { form: { at } } = self.state;
      const { includes } = self.list;
      return [at.call(self.state.form, -1), includes.call(self.list, 7)];
    },
  };
  assert.deepEqual(owner.read(), ['b', true]);
});

QUnit.test('realm source: shadowed names keep missing-slot defaults', assert => {
  function read(self, window, globalThis) {
    const { w: { at } = [11] } = { w: self.self };
    const [{ includes } = [13]] = [window.window];
    const { w: { join } = [17] } = { w: globalThis.globalThis };
    return [at.call([11], 0), includes.call([13], 13), join.call([17], '-')];
  }
  assert.deepEqual(read({}, {}, {}), [11, true, '17']);
});

QUnit.test('realm source: a user conditional is evaluated only once', assert => {
  const log = [];
  function read(self) {
    // eslint-disable-next-line no-void -- Keep the user-written twin of a generated guard.
    const { at, includes } = (log.push('test'), log.length > 1) ? void 0 : self;
    return [at.call(self, 0), includes.call(self, 23)];
  }
  assert.deepEqual(read([23]), [23, true]);
  assert.deepEqual(log, ['test']);
});

QUnit.test('realm source: effectful keys preserve initializer evaluation', assert => {
  const log = [];
  withTemporaryProperty(globalThis, 'window', globalThis, () => {
    // eslint-disable-next-line @stylistic/no-extra-parens -- The effectful computed key is the source form under test.
    const { Array: { from } } = (log.push('prefix'), globalThis)[(log.push('key'), 'window')];
    assert.same(from, Object.getOwnPropertyDescriptor(Array, 'from')?.value);
    assert.deepEqual(log, ['prefix', 'key']);
  });
});

// Namespace isolation is covered by realm-constructor-runtime; this suite also checks
// the retained parameter, loop and assignment forms after the bundler's lowerings.
QUnit.test('a parameter constructor keeps the statics read by its body', assert => {
  function read({ Promise: P } = globalThis) { return typeof P.resolve; }
  assert.same(read(), 'function');
  assert.same(read({ Promise: { resolve: 17 } }), 'number');
  assert.same((({ Promise }) => typeof Promise.allSettled)(globalThis), 'function');
});

QUnit.test('retained constructor patterns keep nested defaults and source identity', assert => {
  let allSettled, length, other, P;
  for ({ Promise: P } of [globalThis]) assert.same(typeof P.allSettled, 'function');
  // eslint-disable-next-line prefer-const, es/no-nonstandard-map-properties -- test a retained assignment with a residual slot
  ({ groupBy: { length = 9 }, other } = Map);
  assert.same(typeof length, 'number');
  assert.same(other, undefined);
  // eslint-disable-next-line @stylistic/no-extra-parens, no-constant-binary-expression -- the consumed selecting assignment is the tested shape
  class Holder { field = ({ Promise: { allSettled } = {} } = (undefined || globalThis)); }
  const holder = new Holder();
  assert.same(holder.field, globalThis);
  assert.same(typeof allSettled, 'function');
});

QUnit.test('a nested parameter instance read keeps its static receiver', assert => {
  function read({ from: { name } = {} } = Array) { return name; }
  function realm({ Array: { of: { name } } } = globalThis) { return name; }
  assert.same(read(), 'from');
  assert.same(realm(), 'of');
  const log = [];
  const receiver = {
    get from() {
      log.push('from');
      return {
        get name() {
          log.push('name');
          return 'own-name';
        },
      };
    },
  };
  assert.same(read(receiver), 'own-name');
  assert.deepEqual(log, ['from', 'name']);
});

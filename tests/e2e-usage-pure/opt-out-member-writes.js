import { withTemporaryProperty } from '../helpers/restore-property.cjs';

// A native write retains the same constructor for earlier captures and later live reads.
QUnit.test('disabled member writes share native constructor identity across the file', assert => {
  const realm = Function('return this')();
  const Native = Function('function P() {} P.resolve = function (x) { return x; }; return P;')();
  withTemporaryProperty(realm, 'Promise', Native, () => {
    const before = Promise;
    // core-js-disable-next-line
    Promise.resolve = value => ({ custom: value });
    assert.same(before, Native, 'capture before write');
    assert.same(Promise, Native, 'live constructor');
    // eslint-disable-next-line es/no-nonstandard-promise-prototype-properties -- the disabled write installs a user function
    assert.same(Promise.resolve(23).custom, 23, 'live member');
  });
});

QUnit.test('disabled delete stays visible to a live constructor read', assert => {
  const realm = Function('return this')();
  const Native = Function('function M() {} M.groupBy = function () {}; return M;')();
  withTemporaryProperty(realm, 'Map', Native, () => {
    // core-js-disable-next-line
    delete Map.groupBy;
    assert.same(Map, Native);
    assert.same(typeof Map.groupBy, 'undefined');
  });
});

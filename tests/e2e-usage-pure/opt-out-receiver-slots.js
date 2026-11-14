import PurePromise from '@core-js/pure/full/promise';
import pureResolve from '@core-js/pure/full/promise/resolve';
import { withTemporaryProperty } from '../helpers/restore-property.cjs';

// The native sentinel exists even in IE and stripped realms; setup stays outside the analysis.
QUnit.test('disabled caller and receiver slots keep their native method', assert => {
  // Post-only sees Babel's erased default comment and rest marker moved onto the helper.
  const lowered = typeof E2E_DETECT_LOWERED !== 'undefined';
  const realm = Function('return this')();
  const Native = Function('function P() {} P.resolve = function (x) { return x; }; return P;')();
  withTemporaryProperty(realm, 'Promise', Native, () => {
    function pick({ resolve }) { return resolve; }
    // core-js-disable-next-line
    const called = pick(Promise);
    assert.same(called, Native.resolve, 'disabled call');
    const argument = (({ resolve }) => resolve)(
      Promise, // core-js-disable-line
    );
    assert.same(argument, Native.resolve, 'disabled argument');
    const { resolve } =
      Promise; // core-js-disable-line
    assert.same(resolve, Native.resolve, 'disabled initializer');
    function defaulted({ resolve: method } =
      Promise, // core-js-disable-line
    ) { return method; }
    assert.same(defaulted(), lowered ? PurePromise.resolve : Native.resolve, 'disabled default');
    for (const { resolve: method } of [
      Promise, // core-js-disable-line
    ]) assert.same(method, Native.resolve, 'disabled loop source');
    const { resolve: restMethod, ...rest } =
      Promise; // core-js-disable-line
    assert.same(restMethod, lowered ? pureResolve : Native.resolve, 'disabled rest source');
    assert.same(typeof rest, 'object');
    withTemporaryProperty(realm, 'globalThis', realm, () => {
      const { Promise: { resolve: nested } } =
        globalThis; // core-js-disable-line
      assert.same(nested, Native.resolve, 'disabled nested realm');
      const optional =
        globalThis // core-js-disable-line
          ?.Promise.resolve;
      assert.same(optional, Native.resolve, 'disabled optional root');
    });
  });
});

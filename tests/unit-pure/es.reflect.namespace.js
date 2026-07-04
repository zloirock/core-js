import { GLOBAL } from '../helpers/constants.js';
import Reflect from '@core-js/pure/actual/reflect/namespace';

QUnit.test('Reflect namespace', assert => {
  assert.same(typeof Reflect, 'object', 'the namespace object exists');
  assert.notSame(Reflect, GLOBAL.Reflect, 'own namespace object, not the native one');
  // no tag assertion here: the entry itself carries no `@@toStringTag` (that negative is
  // locked by the fixture import set) - the SHARED container gets tagged whenever another
  // test in the bundle loads `es.reflect.to-string-tag`, so the brand is not isolatable
});

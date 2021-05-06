import { Observable } from 'core-js-pure/full';

QUnit.test('Observable.of', assert => {
  assert.isFunction(Observable.of);
  assert.arity(Observable.of, 0);
});

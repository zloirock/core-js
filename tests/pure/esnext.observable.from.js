import { Observable } from 'core-js-pure/full';

QUnit.test('Observable.from', assert => {
  assert.isFunction(Observable.from);
  assert.arity(Observable.from, 1);
});

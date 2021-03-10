import { createIterable } from '../helpers/helpers';

import fromEntries from 'core-js-pure/full/object/from-entries';
import Set from 'core-js-pure/full/set';

QUnit.test('Object.fromEntries', assert => {
  assert.isFunction(fromEntries);
  assert.arity(fromEntries, 1);
  assert.name(fromEntries, 'fromEntries');

  assert.ok(fromEntries([]) instanceof Object);
  assert.same(fromEntries([['foo', 1]]).foo, 1);
  assert.same(fromEntries(createIterable([['bar', 2]])).bar, 2);

  class Unit {
    constructor(id) {
      this.id = id;
    }
    toString() {
      return `unit${ this.id }`;
    }
  }
  const units = new Set([new Unit(101), new Unit(102), new Unit(103)]);
  const object = fromEntries(units.entries());
  assert.same(object.unit101.id, 101);
  assert.same(object.unit102.id, 102);
  assert.same(object.unit103.id, 103);
});

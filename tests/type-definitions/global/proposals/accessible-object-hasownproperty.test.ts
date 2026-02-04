import 'core-js/full';
import hasOwn from 'core-js/full/object/has-own';
import $Object from 'core-js/full/object';

$Object.hasOwn({ a: 1 }, 'a');
hasOwn({ a: 1 }, 'a');

// @ts-expect-error
hasOwn(1, 'a');
// @ts-expect-error
$Object.hasOwn(1, 'a');

Object.hasOwn({ a: 1 }, 'a');
Object.hasOwn([], 0);
Object.hasOwn(new Date(), 'toISOString');
Object.hasOwn(Object.create(null), Symbol.iterator);
Object.hasOwn(function () {}, 'call');
Object.hasOwn(Object.prototype, 'toString');

// @ts-expect-error
Object.hasOwn(1, 'a');

// @ts-expect-error
Object.hasOwn({ a: 1 }, {});

// @ts-expect-error
Object.hasOwn({ a: 1 });

// @ts-expect-error
Object.hasOwn();

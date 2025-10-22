import 'core-js/full';

Object.hasOwn({a: 1}, 'a');
Object.hasOwn([], 0);
Object.hasOwn(new Date(), 'toISOString');
Object.hasOwn(Object.create(null), Symbol.iterator);
Object.hasOwn(function(){}, 'call');
Object.hasOwn(Object.prototype, 'toString');

// @ts-expect-error
Object.hasOwn(1, 'a');

// @ts-expect-error
Object.hasOwn({a: 1}, {});

// @ts-expect-error
Object.hasOwn({a: 1});

// @ts-expect-error
Object.hasOwn();

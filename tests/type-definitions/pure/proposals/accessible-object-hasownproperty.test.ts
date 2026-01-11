import objectHasOwn from '@core-js/pure/full/object/has-own';

const res: boolean = objectHasOwn({ a: 1 }, 'a');
objectHasOwn([], 0);
objectHasOwn(new Date(), 'toISOString');
objectHasOwn(Object.create(null), Symbol.iterator);
objectHasOwn(function () {}, 'call');
objectHasOwn(Object.prototype, 'toString');

// @ts-expect-error
objectHasOwn(1, 'a');

// @ts-expect-error
objectHasOwn({ a: 1 }, {});

// @ts-expect-error
objectHasOwn({ a: 1 });

// @ts-expect-error
objectHasOwn();

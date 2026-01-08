import 'core-js/full';

function acceptsNumber(x: number) {}
declare const it: Iterable<number>;

acceptsNumber(Math.sumPrecise(it));
acceptsNumber(Math.sumPrecise([1, 2]));

// @ts-expect-error
Math.sumPrecise('10');

// @ts-expect-error
Math.sumPrecise(1, 2);

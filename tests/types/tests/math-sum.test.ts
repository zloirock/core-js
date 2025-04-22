function acceptsNumber(x: number) {}

acceptsNumber(Math.sumPrecise(0.1, 0.2));
acceptsNumber(Math.sumPrecise(1, 2));

// @ts-expect-error
Math.sumPrecise('10');

// @ts-expect-error
Math.sumPrecise([1, 2]);

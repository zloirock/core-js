import 'core-js/full';

const sym1 = Symbol('foo');
const d1: string | undefined = sym1.description;

const sym2 = Symbol();
const d2: string | undefined = sym2.description;

// @ts-expect-error
sym1['description'] = 'bar';

// @ts-expect-error
const n: number = sym1.description;

// @ts-expect-error
sym2.description();

// @ts-expect-error
s.description = 123;

import $join from '@core-js/pure/full/iterator/join';

declare const it: Iterator<number>;

const res1: string = $join(it, );
const res2: string = $join(it, ' ');
const res3: string = $join(it, 5);
const res4: string = $join(it, Symbol('x'));
const res5: string = $join(it, undefined);
const res6: string = $join(it, null);

// @ts-expect-error
$join(it, '+', '_');
// @ts-expect-error
const res7: number = $join(it, );

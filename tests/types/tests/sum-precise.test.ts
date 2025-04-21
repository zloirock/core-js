import sumPreciseActual from 'core-js-pure/actual/math/sum-precise';
import sumPreciseFull from 'core-js-pure/full/math/sum-precise';

function acceptsNumber(x: number) {}

const a = sumPreciseActual(0.1, 0.2);
const b: number = a;
// @ts-expect-error
sumPreciseActual('10');
// @ts-expect-error
sumPreciseActual([1, 2]);
acceptsNumber(sumPreciseActual(1, 2));

const af = sumPreciseFull(0.1, 0.2);
const bf: number = af;
// @ts-expect-error
sumPreciseFull('10');
// @ts-expect-error
sumPreciseFull([1, 2]);
acceptsNumber(sumPreciseFull(1, 2));

const ga = Math.sumPrecise(0.1, 0.2);
const gb: number = ga;
// @ts-expect-error
Math.sumPrecise('10');
// @ts-expect-error
Math.sumPrecise([1, 2]);
acceptsNumber(Math.sumPrecise(1, 2));

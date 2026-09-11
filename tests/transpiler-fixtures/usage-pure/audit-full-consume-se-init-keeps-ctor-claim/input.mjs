// a fully-consumed destructure whose init carries side effects LIFTS that init verbatim as a
// standalone statement, so the init's own whole-ctor claim must stay live: suppressing it left the
// proxy-global root under it visitable and the lift polyfilled the ROOT instead of the constructor,
// reading a raw native off it and importing the wrong entry. a leaf with no ctor entry keeps the
// root swap (no ctor import), and an effect-free init still drops whole
let e1 = 0;
const { groupBy } = globalThis[(e1++, 'Map')];
export const r1 = [typeof groupBy, e1];
let e2 = 0;
const { allSettled } = (e2++, globalThis).Promise;
export const r2 = [typeof allSettled, e2];
let e3 = 0;
const { values } = globalThis[(e3++, 'Object')];
export const r3 = [typeof values, e3];
let e4 = 0;
let any;
({ any } = globalThis[(e4++, 'Promise')]);
export const r4 = [typeof any, e4];
let e5 = 0;
for (const { ownKeys } = globalThis[(e5++, 'Reflect')]; false; ) break;
export const r5 = [e5];
let e6 = 0;
const { asyncIterator } = (e6++, globalThis[(e6++, 'Symbol')]);
export const r6 = [typeof asyncIterator, e6];
const { fromEntries } = globalThis['Object'];
export const r7 = [typeof fromEntries];

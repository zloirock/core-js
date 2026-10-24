// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
let tail = [{}, {}];

const [, { Iterator: S }] = [...tail, globalThis];
export const viaStaticRead = S.from;

const [, { Map: M }] = [...tail, globalThis];
export const viaCtorConstruct = new M([[1, 2]]);

const [, [{ Promise: P }]] = [...tail, [{ Promise: globalThis.Promise }]];
export const viaNestedShift = P.allSettled([]);

const [{ WeakSet: W }] = [globalThis, ...tail];
export const viaPreSpreadExact = new W();

const [, { Symbol: SY }] = [...tail, flip ? globalThis : self];
export const viaShiftedUnionPure = SY.asyncIterator;

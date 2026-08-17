// a call-optional chain start with an ADJACENT member-optional hop folds the inner call into the
// chainStart test, so one test covers both short-circuits. a NON-polyfilled inner folds as the
// source's own optional call - one receiver read, `this` bound by position - while a polyfilled
// one keeps `.call(recv)`, its dispatcher having consumed the receiver as an argument
const arr = { getIt: () => [[1]], 'a-b': () => [[2]] };
export const safeReceiver = arr.getIt?.()?.flat().at();
export const computedKey = arr['a-b']?.()?.flat().at();
export const withArgs = arr.getIt?.(1)?.flat().at();

const mk = () => ({ getIt: () => [[3]] });
export const seReceiver = mk().getIt?.()?.flat().at();

const nested = [[[4]]];
export const polyfilledInner = nested.flat?.()?.flat().at();

// NEGATIVE: no adjacent optional hop, so nothing folds and the method-get is the test
export const noAdjacentHop = arr.getIt?.().at();
